import type { Request, Response } from 'express'
import prisma from '../lib/db.js'
import { awardXp } from './learner.controller.js'
import { GamificationService } from '../services/gamification.service.js'
import { CourseService } from '../services/course.service.js'
import type { CreateActivityDto, SubmitActivityDto, ReviewSubmissionDto } from '../types/dtos.js'

// GET /api/activities
export async function getActivities(_req: Request, res: Response): Promise<void> {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' },
      include: {
        learningOutcome: true,
        submissions: {
          select: { id: true, reviewStatus: true }
        }
      }
    })

    const formatted = activities.map(act => {
      const submissionCount = act.submissions?.length || 0
      const pendingReviewsCount = act.submissions?.filter(s => s.reviewStatus === 'pending').length || 0
      const { submissions, ...rest } = act
      return {
        ...rest,
        hasStudentSubmissions: submissionCount > 0,
        submissionCount,
        pendingReviewsCount
      }
    })

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener actividades.' })
  }
}

// GET /api/activities/my-submissions?apprenticeId=:id
export async function getMySubmissions(req: Request, res: Response): Promise<void> {
  try {
    const rawApprenticeId = req.query.apprenticeId || (req as any).user?.id
    const apprenticeId = parseInt(String(rawApprenticeId))
    if (!apprenticeId || isNaN(apprenticeId)) {
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

    const rawApprenticeId = req.body.apprenticeId || (req as any).user?.id
    const apprenticeId = parseInt(String(rawApprenticeId))
    if (!apprenticeId || isNaN(apprenticeId)) {
      res.status(400).json({ message: 'apprenticeId es requerido.' })
      return
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      res.status(404).json({ message: 'Actividad no encontrada.' })
      return
    }

    const hasOpenQuestion = Array.isArray(req.body.answers) && req.body.answers.some((a: any) => a?.type === 'open')

    // Verificar si el aprendiz ya había aprobado esta actividad previamente
    const existingSubmission = await prisma.activitySubmission.findUnique({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId } }
    })
    const wasAlreadyPassed = existingSubmission?.passed === true

    // Si ya estaba aprobada previamente, preservamos el estado aprobado para que una práctica no degrade el historial
    const finalPassed = wasAlreadyPassed ? true : (hasOpenQuestion ? false : Boolean(req.body.passed))
    const reviewStatus = wasAlreadyPassed 
      ? (existingSubmission?.reviewStatus || 'graded') 
      : (hasOpenQuestion ? 'pending' : 'graded')
    const answersJson = Array.isArray(req.body.answers) ? JSON.stringify(req.body.answers) : (existingSubmission?.answers || '[]')

    const submission = await prisma.activitySubmission.upsert({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId } },
      update: { passed: finalPassed, answers: answersJson, reviewStatus, submittedAt: new Date() },
      create: { activityId: id, apprenticeId, passed: finalPassed, answers: answersJson, reviewStatus }
    })

    if (!activity.hasStudentSubmissions) {
      await prisma.activity.update({
        where: { id },
        data: { hasStudentSubmissions: true }
      })
    }

    let xpAwarded = 0
    let newXpTotal = 0

    if (finalPassed && !hasOpenQuestion && !wasAlreadyPassed) {
      try {
        const points = activity.points || 10
        newXpTotal = await GamificationService.awardXp(
          apprenticeId,
          points,
          `Reto "${activity.title}" completado`
        )
        xpAwarded = points
      } catch (e) {
        console.error('XP award error:', e)
      }
    } else {
      const u = await prisma.user.findUnique({ where: { id: apprenticeId }, select: { xp: true } })
      newXpTotal = u?.xp || 0
      xpAwarded = 0
    }

    // Auto-actualizar progreso del curso si la actividad pertenece a uno
    if (activity.course && finalPassed) {
      try {
        const course = await prisma.course.findFirst({
          where: {
            OR: [
              { title: { equals: activity.course, mode: 'insensitive' } },
              { slug: { equals: activity.course.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
            ]
          }
        })
        if (course) {
          const phaseNorm = (activity.phase || 'practica').toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const validPhases = ['inicio', 'estudio', 'practica', 'evaluacion']
          const targetPhase = validPhases.includes(phaseNorm) ? phaseNorm : 'practica'

          const courseActivities = await prisma.activity.findMany({
            where: { course: activity.course }
          })
          const phaseActivities = courseActivities.filter(a =>
            (a.phase || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === targetPhase
          )
          const passedInPhase = await prisma.activitySubmission.count({
            where: {
              apprenticeId,
              passed: true,
              activityId: { in: phaseActivities.map(a => a.id) }
            }
          })
          const phasePct = phaseActivities.length > 0
            ? Math.min(100, Math.round((passedInPhase / phaseActivities.length) * 100))
            : 100

          await CourseService.saveCourseProgress(course.id, apprenticeId, {
            phase: targetPhase as any,
            phasePercentage: Math.max(phasePct, 25)
          })
        }
      } catch (err) {
        console.warn('Could not auto-update course progress from activity:', err)
      }
    }

    res.json({
      ...submission,
      xpAwarded,
      newXpTotal,
      wasAlreadyPassed
    })
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
      select: { id: true, nombre: true, apellido: true, cedula: true, correo: true }
    })
    const apprenticeMap = Object.fromEntries(apprentices.map((a: { id: number; nombre: string; apellido: string; cedula?: string; correo?: string | null }) => [a.id, a]))

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
      const act = await prisma.activity.findUnique({ where: { id }, select: { title: true, points: true } })
      if (act) {
        try {
          await GamificationService.awardXp(
            apprenticeId,
            act.points,
            `Entrega de reto "${act.title}" evaluada y aprobada`
          )
        } catch (e) {
          console.error('XP award error on review:', e)
        }
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
      courseId,
      phase,
      template,
      points,
      attemptsLimit,
      successMessage,
      hintMessage,
      description,
      icon,
      color,
      order,
      visible,
      required,
      orderItems,
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
        courseId: courseId ? parseInt(String(courseId)) : null,
        phase,
        template,
        points: parseInt(String(points)) || 10,
        attemptsLimit: attemptsLimit || 'Ilimitados',
        successMessage: successMessage || '¡Excelente trabajo! Has acertado.',
        hintMessage: hintMessage || '',
        description: description || null,
        icon: icon || null,
        color: color || null,
        order: order !== undefined ? (parseInt(String(order)) || 0) : 0,
        visible: visible !== undefined ? Boolean(visible) : true,
        required: required !== undefined ? Boolean(required) : true,
        orderItems: orderItems || null,
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

// PUT /api/activities/reorder
export async function reorderActivities(req: Request, res: Response): Promise<void> {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : []
    let updated = 0
    for (const item of items) {
      const id = parseInt(String(item?.id))
      const order = parseInt(String(item?.order))
      if (isNaN(id) || isNaN(order)) continue
      await prisma.activity.update({ where: { id }, data: { order } })
      updated++
    }
    res.json({ message: 'Orden actualizado.', updated })
  } catch (error) {
    console.error('Error reordering activities:', error)
    res.status(500).json({ message: 'Error interno del servidor al reordenar actividades.' })
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
      courseId,
      phase,
      template,
      points,
      attemptsLimit,
      successMessage,
      hintMessage,
      description,
      icon,
      color,
      order,
      visible,
      required,
      orderItems,
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

    const realSubmissions = await prisma.activitySubmission.count({
      where: { activityId: id }
    })

    // Con entregas existentes solo se permite ajustar presentación, orden y visibilidad
    const contentUpdate = realSubmissions === 0

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        icon: icon !== undefined ? icon : existing.icon,
        color: color !== undefined ? color : existing.color,
        order: order !== undefined ? (parseInt(String(order)) || 0) : existing.order,
        visible: visible !== undefined ? Boolean(visible) : existing.visible,
        required: required !== undefined ? Boolean(required) : existing.required,
        ...(contentUpdate ? {
          course: course !== undefined ? course : existing.course,
          courseId: courseId !== undefined ? (courseId ? parseInt(String(courseId)) : null) : existing.courseId,
          phase: phase !== undefined ? phase : existing.phase,
          template: template !== undefined ? template : existing.template,
          points: points !== undefined ? (parseInt(String(points)) || 10) : existing.points,
          attemptsLimit: attemptsLimit !== undefined ? attemptsLimit : existing.attemptsLimit,
          successMessage: successMessage !== undefined ? successMessage : existing.successMessage,
          hintMessage: hintMessage !== undefined ? hintMessage : existing.hintMessage,
          orderItems: orderItems !== undefined ? orderItems : existing.orderItems,
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
        } : {})
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

    const realSubmissions = await prisma.activitySubmission.count({
      where: { activityId: id }
    })

    if (realSubmissions > 0) {
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
