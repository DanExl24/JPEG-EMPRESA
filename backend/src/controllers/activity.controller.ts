import type { Request, Response } from 'express'
import prisma from '../lib/db.js'
import { awardXp } from './learner.controller.js'
import type { CreateActivityDto, SubmitActivityDto, ReviewSubmissionDto } from '../types/dtos.js'

// GET /api/activities
export async function getActivities(_req: Request, res: Response): Promise<void> {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' },
      include: { learningOutcome: true }
    })
    res.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener actividades.' })
  }
}

// GET /api/activities/my-submissions?apprenticeId=:id
export async function getMySubmissions(req: Request, res: Response): Promise<void> {
  try {
    const apprenticeId = parseInt(req.query.apprenticeId as string)
    if (isNaN(apprenticeId)) {
      res.status(400).json({ message: 'apprenticeId es requerido.' })
      return
    }
    const submissions = await prisma.activitySubmission.findMany({
      where: { apprenticeId }
    })
    res.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// GET /api/activities/:id
export async function getActivityById(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { learningOutcome: true }
    })
    if (!activity) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }
    res.json(activity)
  } catch (error) {
    console.error('Error fetching activity by id:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener la actividad.' })
  }
}

// POST /api/activities/:id/submit
export async function submitActivity(req: Request<{ id: string }, unknown, SubmitActivityDto>, res: Response): Promise<void> {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const { apprenticeId, passed, answers } = req.body
    if (!apprenticeId) {
      res.status(400).json({ message: 'apprenticeId es requerido.' })
      return
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }

    const hasOpenQuestion = Array.isArray(answers) && answers.some((a: any) => a?.type === 'open')
    const reviewStatus = hasOpenQuestion ? 'pending' : 'graded'
    const finalPassed = hasOpenQuestion ? false : Boolean(passed)
    const answersJson = Array.isArray(answers) ? JSON.stringify(answers) : '[]'

    const submission = await prisma.activitySubmission.upsert({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId: parseInt(String(apprenticeId)) } },
      update: { passed: finalPassed, answers: answersJson, reviewStatus, submittedAt: new Date() },
      create: { activityId: id, apprenticeId: parseInt(String(apprenticeId)), passed: finalPassed, answers: answersJson, reviewStatus }
    })

    if (!activity.hasStudentSubmissions) {
      await prisma.activity.update({
        where: { id },
        data: { hasStudentSubmissions: true }
      })
    }

    if (finalPassed && !hasOpenQuestion) {
      try { await awardXp(parseInt(String(apprenticeId)), activity.points) } catch (e) { console.error('XP award error:', e) }
    }

    res.json(submission)
  } catch (error) {
    console.error('Error submitting activity:', error)
    res.status(500).json({ message: 'Error interno del servidor al registrar la entrega.' })
  }
}

// GET /api/activities/:id/submissions
export async function getActivitySubmissions(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId: id },
      orderBy: { submittedAt: 'desc' }
    })

    const apprenticeIds = submissions.map((s: { apprenticeId: number }) => s.apprenticeId)
    const apprentices = await prisma.user.findMany({
      where: { id: { in: apprenticeIds } },
      select: { id: true, nombre: true, apellido: true }
    })
    const apprenticeMap = Object.fromEntries(apprentices.map((a: { id: number; nombre: string; apellido: string }) => [a.id, a]))

    const result = submissions.map((s: { answers: string | null; apprenticeId: number; [key: string]: any }) => ({
      ...s,
      answers: JSON.parse(s.answers || '[]'),
      apprentice: apprenticeMap[s.apprenticeId] || null
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching activity submissions:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener entregas.' })
  }
}

// PATCH /api/activities/:id/submissions/:apprenticeId/review
export async function reviewSubmission(req: Request<{ id: string; apprenticeId: string }, unknown, ReviewSubmissionDto & { answers?: unknown[]; approved?: boolean }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id)
    const apprenticeId = parseInt(req.params.apprenticeId)
    if (isNaN(id) || isNaN(apprenticeId)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const { answers, approved } = req.body
    if (!Array.isArray(answers)) {
      res.status(400).json({ message: 'answers (array) es requerido.' })
      return
    }

    const submission = await prisma.activitySubmission.update({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId } },
      data: {
        answers: JSON.stringify(answers),
        reviewStatus: 'reviewed',
        passed: Boolean(approved)
      }
    })

    if (approved) {
      const act = await prisma.activity.findUnique({ where: { id }, select: { points: true } })
      if (act) {
        try { await awardXp(apprenticeId, act.points) } catch (e) { console.error('XP award error:', e) }
      }
    }

    res.json(submission)
  } catch (error) {
    console.error('Error reviewing submission:', error)
    res.status(500).json({ message: 'Error interno del servidor al revisar la entrega.' })
  }
}

// POST /api/activities
export async function createActivity(req: Request<unknown, unknown, CreateActivityDto>, res: Response): Promise<void> {
  try {
    const {
      title,
      course,
      phase,
      template,
      points,
      attemptsLimit,
      successMessage,
      hintMessage,
      sopaWords,
      crossword1Clue,
      crossword1Word,
      quizQuestion,
      quizCorrect,
      quizIncorrect,
      matchTerm,
      matchMeaning,
      listeningPhrase,
      pronouncePhrase,
      fillblankSentence,
      fillblankAnswer,
      learningOutcomeId
    } = req.body

    if (!title || !course || !phase || !template) {
      res.status(400).json({ message: 'Título, curso, fase y plantilla son obligatorios.' })
      return
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        course,
        phase,
        template,
        points: parseInt(String(points)) || 10,
        attemptsLimit: attemptsLimit || 'Ilimitados',
        successMessage: successMessage || '¡Excelente trabajo! Has acertado.',
        hintMessage: hintMessage || '',
        sopaWords,
        crossword1Clue,
        crossword1Word,
        quizQuestion,
        quizCorrect,
        quizIncorrect,
        matchTerm,
        matchMeaning,
        listeningPhrase,
        pronouncePhrase,
        fillblankSentence,
        fillblankAnswer,
        learningOutcomeId: learningOutcomeId ? parseInt(String(learningOutcomeId)) : null,
        hasStudentSubmissions: false
      }
    })

    res.status(201).json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    res.status(500).json({ message: 'Error interno del servidor al crear actividad.' })
  }
}

// PUT /api/activities/:id
export async function updateActivity(req: Request<{ id: string }, unknown, Partial<CreateActivityDto>>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const {
      title,
      course,
      phase,
      template,
      points,
      attemptsLimit,
      successMessage,
      hintMessage,
      sopaWords,
      crossword1Clue,
      crossword1Word,
      quizQuestion,
      quizCorrect,
      quizIncorrect,
      matchTerm,
      matchMeaning,
      listeningPhrase,
      pronouncePhrase,
      fillblankSentence,
      fillblankAnswer,
      learningOutcomeId
    } = req.body

    const existing = await prisma.activity.findUnique({
      where: { id }
    })

    if (!existing) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }

    if (existing.hasStudentSubmissions) {
      res.status(400).json({ message: 'Esta actividad ya fue resuelta por aprendices y no puede ser modificada.' })
      return
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        course: course !== undefined ? course : existing.course,
        phase: phase !== undefined ? phase : existing.phase,
        template: template !== undefined ? template : existing.template,
        points: points !== undefined ? (parseInt(String(points)) || 10) : existing.points,
        attemptsLimit: attemptsLimit !== undefined ? attemptsLimit : existing.attemptsLimit,
        successMessage: successMessage !== undefined ? successMessage : existing.successMessage,
        hintMessage: hintMessage !== undefined ? hintMessage : existing.hintMessage,
        sopaWords,
        crossword1Clue,
        crossword1Word,
        quizQuestion,
        quizCorrect,
        quizIncorrect,
        matchTerm,
        matchMeaning,
        listeningPhrase,
        pronouncePhrase,
        fillblankSentence,
        fillblankAnswer,
        learningOutcomeId: learningOutcomeId !== undefined ? (learningOutcomeId ? parseInt(String(learningOutcomeId)) : null) : existing.learningOutcomeId
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Error updating activity:', error)
    res.status(500).json({ message: 'Error interno del servidor al actualizar actividad.' })
  }
}

// GET /api/activities/:id/submissions/export-csv
export async function exportSubmissionsCsv(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId: id },
      orderBy: { submittedAt: 'asc' }
    })

    const apprenticeIds = submissions.map((s: { apprenticeId: number }) => s.apprenticeId)
    const apprentices = await prisma.user.findMany({
      where: { id: { in: apprenticeIds } },
      select: { id: true, nombre: true, apellido: true, cedula: true }
    })
    const apprenticeMap = Object.fromEntries(apprentices.map((a: { id: number; nombre: string; apellido: string; cedula: string }) => [a.id, a]))

    const headers = [
      'ID Aprendiz',
      'Cédula',
      'Nombre',
      'Apellido',
      'Actividad',
      'Plantilla',
      'Pasó',
      'Estado de Revisión',
      'Puntos',
      'Fecha de Entrega'
    ]

    const SEPARATOR = ';'

    const escapeCell = (value: unknown) => {
      const str = String(value ?? '')
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const reviewStatusLabel = (status: string) => {
      if (status === 'pending') return 'Pendiente de revisión'
      if (status === 'reviewed') return 'Revisada'
      return 'Calificada'
    }

    const rows = submissions.map((s: { apprenticeId: number; passed: boolean; reviewStatus: string; submittedAt: Date | string }) => {
      const appr = apprenticeMap[s.apprenticeId] || {}
      return [
        escapeCell(s.apprenticeId),
        escapeCell(appr.cedula || ''),
        escapeCell(appr.nombre || ''),
        escapeCell(appr.apellido || ''),
        escapeCell(activity.title),
        escapeCell(activity.template),
        escapeCell(s.passed ? 'Sí' : 'No'),
        escapeCell(reviewStatusLabel(s.reviewStatus)),
        escapeCell(activity.points),
        escapeCell(new Date(s.submittedAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' }))
      ].join(SEPARATOR)
    })

    const csvContent = [`sep=${SEPARATOR}`, headers.join(SEPARATOR), ...rows].join('\r\n')
    const filename = `actividad_${id}_entregas_${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=windows-1252')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    const contentBuffer = Buffer.from(csvContent, 'latin1')
    res.send(contentBuffer)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    res.status(500).json({ message: 'Error interno del servidor al exportar CSV.' })
  }
}

// DELETE /api/activities/:id
export async function deleteActivity(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido.' })
      return
    }

    const existing = await prisma.activity.findUnique({
      where: { id }
    })

    if (!existing) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }

    if (existing.hasStudentSubmissions) {
      res.status(400).json({ message: 'Esta actividad ya fue resuelta por aprendices y no puede ser eliminada.' })
      return
    }

    await prisma.activity.delete({
      where: { id }
    })

    res.json({ message: 'Actividad eliminada correctamente.' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    res.status(500).json({ message: 'Error interno del servidor al eliminar actividad.' })
  }
}
