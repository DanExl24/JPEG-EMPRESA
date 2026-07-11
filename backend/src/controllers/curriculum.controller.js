import prisma from '../lib/db.js'

// --- PROGRAMS/LEVELS ---
export async function getPrograms(req, res) {
  try {
    const list = await prisma.trainingProgram.findMany({
      include: {
        competencies: {
          include: {
            learning_outcomes: true
          }
        }
      }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar programas.', error: err.message })
  }
}

export async function createProgram(req, res) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio.' })
    
    const created = await prisma.trainingProgram.create({
      data: { name }
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Error al crear programa.', error: err.message })
  }
}

export async function updateProgram(req, res) {
  try {
    const { id } = req.params
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio.' })

    const updated = await prisma.trainingProgram.update({
      where: { id: parseInt(id) },
      data: { name }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar programa.', error: err.message })
  }
}

export async function deleteProgram(req, res) {
  try {
    const { id } = req.params
    await prisma.trainingProgram.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Programa eliminado correctamente.' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar programa.', error: err.message })
  }
}

// --- COMPETENCIES ---
export async function getCompetencies(req, res) {
  try {
    const list = await prisma.competency.findMany({
      include: {
        program: true,
        learning_outcomes: true
      }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar competencias.', error: err.message })
  }
}

export async function createCompetency(req, res) {
  try {
    const { code, name, programId } = req.body
    if (!code || !name || !programId) {
      return res.status(400).json({ message: 'Código, nombre y programa son obligatorios.' })
    }

    const created = await prisma.competency.create({
      data: {
        code,
        name,
        program_id: parseInt(programId)
      }
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Error al crear competencia.', error: err.message })
  }
}

export async function updateCompetency(req, res) {
  try {
    const { id } = req.params
    const { code, name, programId } = req.body
    if (!code || !name || !programId) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' })
    }

    const updated = await prisma.competency.update({
      where: { id: parseInt(id) },
      data: {
        code,
        name,
        program_id: parseInt(programId)
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar competencia.', error: err.message })
  }
}

export async function deleteCompetency(req, res) {
  try {
    const { id } = req.params
    await prisma.competency.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Competencia eliminada correctamente.' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar competencia.', error: err.message })
  }
}

// --- RAPs / LEARNING OUTCOMES ---
export async function getRaps(req, res) {
  try {
    const list = await prisma.learningOutcome.findMany({
      include: {
        competency: true
      }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar RAPs.', error: err.message })
  }
}

export async function createRap(req, res) {
  try {
    const { code, name, competencyId } = req.body
    if (!code || !name || !competencyId) {
      return res.status(400).json({ message: 'Código, nombre y competencia son obligatorios.' })
    }

    const created = await prisma.learningOutcome.create({
      data: {
        code,
        name,
        competency_id: parseInt(competencyId)
      }
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Error al crear RAP.', error: err.message })
  }
}

export async function updateRap(req, res) {
  try {
    const { id } = req.params
    const { code, name, competencyId } = req.body
    if (!code || !name || !competencyId) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
    }

    const updated = await prisma.learningOutcome.update({
      where: { id: parseInt(id) },
      data: {
        code,
        name,
        competency_id: parseInt(competencyId)
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar RAP.', error: err.message })
  }
}

export async function deleteRap(req, res) {
  try {
    const { id } = req.params
    await prisma.learningOutcome.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'RAP eliminado correctamente.' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar RAP.', error: err.message })
  }
}
