import prisma from '../lib/db.js'

// GET /api/activities
export async function getActivities(req, res) {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' }
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
    const activity = await prisma.activity.findUnique({ where: { id } })
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

    const { apprenticeId, passed } = req.body
    if (!apprenticeId) {
      return res.status(400).json({ message: 'apprenticeId es requerido.' })
    }

    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada.' })
    }

    // Upsert: if already submitted, update; otherwise create
    const submission = await prisma.activitySubmission.upsert({
      where: { activityId_apprenticeId: { activityId: id, apprenticeId: parseInt(apprenticeId) } },
      update: { passed: Boolean(passed), submittedAt: new Date() },
      create: { activityId: id, apprenticeId: parseInt(apprenticeId), passed: Boolean(passed) }
    })

    // Mark activity as having student submissions
    if (!activity.hasStudentSubmissions) {
      await prisma.activity.update({
        where: { id },
        data: { hasStudentSubmissions: true }
      })
    }

    return res.json(submission)
  } catch (error) {
    console.error('Error submitting activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al registrar la entrega.' })
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
      pronouncePhrase
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
      pronouncePhrase
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
        pronouncePhrase
      }
    })

    return res.json(updated)
  } catch (error) {
    console.error('Error updating activity:', error)
    return res.status(500).json({ message: 'Error interno del servidor al actualizar actividad.' })
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
