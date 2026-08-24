import type { Request, Response } from 'express'
import prisma from '../lib/db.js'
import type {
  CreateTrainingProgramDto,
  CreateCompetencyDto,
  CreateLearningOutcomeDto
} from '../types/dtos.js'

// --- PROGRAMS/LEVELS ---
export async function getPrograms(_req: Request, res: Response): Promise<void> {
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
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al listar programas.', error: errorObj.message })
  }
}

export async function createProgram(req: Request<unknown, unknown, CreateTrainingProgramDto>, res: Response): Promise<void> {
  try {
    const { name } = req.body || {}
    if (!name) {
      res.status(400).json({ message: 'El nombre es obligatorio.' })
      return
    }
    
    const created = await prisma.trainingProgram.create({
      data: { name }
    })
    res.status(201).json(created)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al crear programa.', error: errorObj.message })
  }
}

export async function updateProgram(req: Request<{ id: string }, unknown, CreateTrainingProgramDto>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { name } = req.body || {}
    if (!name) {
      res.status(400).json({ message: 'El nombre es obligatorio.' })
      return
    }

    const updated = await prisma.trainingProgram.update({
      where: { id: parseInt(id) },
      data: { name }
    })
    res.json(updated)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al actualizar programa.', error: errorObj.message })
  }
}

export async function deleteProgram(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    await prisma.trainingProgram.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Programa eliminado correctamente.' })
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al eliminar programa.', error: errorObj.message })
  }
}

// --- COMPETENCIES ---
export async function getCompetencies(_req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.competency.findMany({
      include: {
        program: true,
        learning_outcomes: true
      }
    })
    res.json(list)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al listar competencias.', error: errorObj.message })
  }
}

export async function createCompetency(req: Request<unknown, unknown, CreateCompetencyDto & { programId?: number }>, res: Response): Promise<void> {
  try {
    const { code, name, program_id, programId } = req.body || {}
    const finalProgramId = program_id || programId
    if (!code || !name || !finalProgramId) {
      res.status(400).json({ message: 'Código, nombre y programa son obligatorios.' })
      return
    }

    const created = await prisma.competency.create({
      data: {
        code,
        name,
        program_id: parseInt(String(finalProgramId))
      }
    })
    res.status(201).json(created)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al crear competencia.', error: errorObj.message })
  }
}

export async function updateCompetency(req: Request<{ id: string }, unknown, Partial<CreateCompetencyDto & { programId?: number }>>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { code, name, program_id, programId } = req.body || {}
    const finalProgramId = program_id || programId
    if (!code || !name || !finalProgramId) {
      res.status(400).json({ message: 'Todos los campos son requeridos.' })
      return
    }

    const updated = await prisma.competency.update({
      where: { id: parseInt(id) },
      data: {
        code,
        name,
        program_id: parseInt(String(finalProgramId))
      }
    })
    res.json(updated)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al actualizar competencia.', error: errorObj.message })
  }
}

export async function deleteCompetency(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    await prisma.competency.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Competencia eliminada correctamente.' })
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al eliminar competencia.', error: errorObj.message })
  }
}

// --- RAPs / LEARNING OUTCOMES ---
export async function getRaps(_req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.learningOutcome.findMany({
      include: {
        competency: true
      }
    })
    res.json(list)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al listar RAPs.', error: errorObj.message })
  }
}

export async function createRap(req: Request<unknown, unknown, CreateLearningOutcomeDto & { competencyId?: number }>, res: Response): Promise<void> {
  try {
    const { code, name, competency_id, competencyId } = req.body || {}
    const finalCompId = competency_id || competencyId
    if (!code || !name || !finalCompId) {
      res.status(400).json({ message: 'Código, nombre y competencia son obligatorios.' })
      return
    }

    const created = await prisma.learningOutcome.create({
      data: {
        code,
        name,
        competency_id: parseInt(String(finalCompId))
      }
    })
    res.status(201).json(created)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al crear RAP.', error: errorObj.message })
  }
}

export async function updateRap(req: Request<{ id: string }, unknown, Partial<CreateLearningOutcomeDto & { competencyId?: number }>>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { code, name, competency_id, competencyId } = req.body || {}
    const finalCompId = competency_id || competencyId
    if (!code || !name || !finalCompId) {
      res.status(400).json({ message: 'Todos los campos son obligatorios.' })
      return
    }

    const updated = await prisma.learningOutcome.update({
      where: { id: parseInt(id) },
      data: {
        code,
        name,
        competency_id: parseInt(String(finalCompId))
      }
    })
    res.json(updated)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al actualizar RAP.', error: errorObj.message })
  }
}

export async function deleteRap(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params
    await prisma.learningOutcome.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'RAP eliminado correctamente.' })
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al eliminar RAP.', error: errorObj.message })
  }
}
