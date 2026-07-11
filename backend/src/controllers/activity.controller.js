import prisma from '../lib/db.js'
import { awardXp } from './learner.controller.js'

// GET /api/activities
export async function getActivities(req, res) {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' },
      include: { learningOutcome: true }
    })
    return res.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return res.status(500).json({ message: 'Error interno del servidor al obtener actividades.' })
  }
}

// GET /api/activities/my-submissions?apprenticeId=:id
export async function getMySubmissions(req, res) {
  try {
    const apprenticeId = parseInt(req.query.apprenticeId)
    if (isNaN(apprenticeId)) {
      return res.status(400).json({ message: 'apprenticeId es requerido.' })
    }
    const submissions = await prisma.activitySubmission.findMany({
      where: { apprenticeId }
    })
    return res.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// GET /api/activities/:id
export async function getActivityById(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { learningOutcome: true }
    })
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }
    return res.json(activity)
  } catch (error) {
    console.error('Error fetching activity by id:', error)
    return res.status(500).json({ message: 'Error interno del servidor al obtener la actividad.' })
  }
}

// POST /api/activities/:id/submit
export async function submitActivity(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const { apprenticeId, passed, answers } = req.body
    if (!apprenticeId) {
      return res.status(400).json({ message: 'apprenticeId es requerido.' })
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }

    // Si la entrega incluye preguntas abiertas, queda pendiente de revision del instructor
    const hasOpenQuestion = Array.isArray(answers) && answers.some(a => a.type === 'open')
    const reviewStatus = hasOpenQuestion ? 'pending' : 'graded'
    const finalPassed = hasOpenQuestion ? false : Boolean(passed)
    const answersJson = Array.isArray(answers) ? JSON.stringify(answers) : '[]'

    // Upsert: if already submitted, update; otherwise create
    const submission = await prisma.activitySubmission.upsert({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId: parseInt(apprenticeId) } },
      update: { passed: finalPassed, answers: answersJson, reviewStatus, submittedAt: new Date() },
      create: { activityId: id, apprenticeId: parseInt(apprenticeId), passed: finalPassed, answers: answersJson, reviewStatus }
    })

    // Mark activity as having student submissions
    if (!activity.hasStudentSubmissions) {
      await prisma.activity.update({
        where: { id },
        data: { hasStudentSubmissions: true }
      })
    }

    // Award XP if passed
    if (finalPassed && !hasOpenQuestion) {
      try { await awardXp(parseInt(apprenticeId), activity.points) } catch (e) { console.error('XP award error:', e) }
    }

    return res.json(submission)
  } catch (error) {
    console.error('Error submitting activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al registrar la entrega.' })
  }
}

// GET /api/activities/:id/submissions  (instructor: ver entregas, incluye pendientes de revision)
export async function getActivitySubmissions(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId: id },
      orderBy: { submittedAt: 'desc' }
    })

    const apprenticeIds = submissions.map(s => s.apprenticeId)
    const apprentices = await prisma.user.findMany({
      where: { id: { in: apprenticeIds } },
      select: { id: true, nombre: true, apellido: true }
    })
    const apprenticeMap = Object.fromEntries(apprentices.map(a => [a.id, a]))

    const result = submissions.map(s => ({
      ...s,
      answers: JSON.parse(s.answers || '[]'),
      apprentice: apprenticeMap[s.apprenticeId] || null
    }))

    return res.json(result)
  } catch (error) {
    console.error('Error fetching activity submissions:', error)
    return res.status(500).json({ message: 'Error interno del servidor al obtener entregas.' })
  }
}

// PATCH /api/activities/:id/submissions/:apprenticeId/review
export async function reviewSubmission(req, res) {
  try {
    const id = parseInt(req.params.id)
    const apprenticeId = parseInt(req.params.apprenticeId)
    if (isNaN(id) || isNaN(apprenticeId)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const { answers, approved } = req.body
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers (array) es requerido.' })
    }

    const submission = await prisma.activitySubmission.update({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId } },
      data: {
        answers: JSON.stringify(answers),
        reviewStatus: 'reviewed',
        passed: Boolean(approved)
      }
    })

    // Award XP when instructor approves open-question submission
    if (approved) {
      const act = await prisma.activity.findUnique({ where: { id }, select: { points: true } })
      if (act) {
        try { await awardXp(apprenticeId, act.points) } catch (e) { console.error('XP award error:', e) }
      }
    }

    return res.json(submission)
  } catch (error) {
    console.error('Error reviewing submission:', error)
    return res.status(500).json({ message: 'Error interno del servidor al revisar la entrega.' })
  }
}

// POST /api/activities

export async function createActivity(req, res) {
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
      learningOutcomeId
    } = req.body

    if (!title || !course || !phase || !template) {
      return res.status(400).json({ message: 'Título, curso, fase y plantilla son obligatorios.' })
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        course,
        phase,
        template,
        points: parseInt(points) || 10,
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
        learningOutcomeId: learningOutcomeId ? parseInt(learningOutcomeId) : null,
        hasStudentSubmissions: false
      }
    })

    return res.status(201).json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al crear actividad.' })
  }
}

// PUT /api/activities/:id
export async function updateActivity(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
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
      learningOutcomeId
    } = req.body

    const existing = await prisma.activity.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }

    if (existing.hasStudentSubmissions) {
      return res.status(400).json({ message: 'Esta actividad ya fue resuelta por aprendices y no puede ser modificada.' })
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        course: course !== undefined ? course : existing.course,
        phase: phase !== undefined ? phase : existing.phase,
        template: template !== undefined ? template : existing.template,
        points: points !== undefined ? (parseInt(points) || 10) : existing.points,
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
        learningOutcomeId: learningOutcomeId !== undefined ? (learningOutcomeId ? parseInt(learningOutcomeId) : null) : existing.learningOutcomeId
      }
    })

    return res.json(updated)
  } catch (error) {
    console.error('Error updating activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al actualizar actividad.' })
  }
}

// GET /api/activities/:id/submissions/export-csv  (instructor: descargar entregas como CSV)
export async function exportSubmissionsCsv(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId: id },
      orderBy: { submittedAt: 'asc' }
    })

    const apprenticeIds = submissions.map(s => s.apprenticeId)
    const apprentices = await prisma.user.findMany({
      where: { id: { in: apprenticeIds } },
      select: { id: true, nombre: true, apellido: true, cedula: true }
    })
    const apprenticeMap = Object.fromEntries(apprentices.map(a => [a.id, a]))

    // Build CSV header
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

    const escapeCell = (value) => {
      const str = String(value ?? '')
      // Wrap in quotes if contains semicolon, quote, or newline
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const reviewStatusLabel = (status) => {
      if (status === 'pending') return 'Pendiente de revisión'
      if (status === 'reviewed') return 'Revisada'
      return 'Calificada'
    }

    const rows = submissions.map(s => {
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

    // 'sep=;' hint: tells Excel which separator to use regardless of regional settings
    const csvContent = [`sep=${SEPARATOR}`, headers.join(SEPARATOR), ...rows].join('\r\n')
    const filename = `actividad_${id}_entregas_${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=windows-1252')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    // Encode as Windows-1252 (Latin-1) — Excel on Spanish Windows uses this encoding by default.
    // Node.js 'latin1' maps Unicode U+0000–U+00FF directly to bytes 0x00–0xFF,
    // so Spanish accented chars (á é í ó ú ñ) encode correctly without any extra library.
    const contentBuffer = Buffer.from(csvContent, 'latin1')
    return res.send(contentBuffer)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return res.status(500).json({ message: 'Error interno del servidor al exportar CSV.' })
  }
}

// DELETE /api/activities/:id
export async function deleteActivity(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' })
    }

    const existing = await prisma.activity.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }

    if (existing.hasStudentSubmissions) {
      return res.status(400).json({ message: 'Esta actividad ya fue resuelta por aprendices y no puede ser eliminada.' })
    }

    await prisma.activity.delete({
      where: { id }
    })

    return res.json({ message: 'Actividad eliminada correctamente.' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al eliminar actividad.' })
  }
}
