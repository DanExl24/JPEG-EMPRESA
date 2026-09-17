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
        },
        courses: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { id: 'asc' }
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
      data: { name: name.trim() }
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
      data: { name: name.trim() }
    })
    res.json(updated)
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al actualizar programa.', error: errorObj.message })
  }
}

export async function deleteProgram(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const programId = parseInt(req.params.id)
    if (isNaN(programId)) {
      res.status(400).json({ message: 'ID de programa inválido.' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // 1. Obtener IDs de competencias asociadas
      const compList = await tx.competency.findMany({
        where: { program_id: programId },
        select: { id: true }
      })
      const compIds = compList.map(c => c.id)

      if (compIds.length > 0) {
        // 2. Obtener RAPs de esas competencias
        const rapList = await tx.learningOutcome.findMany({
          where: { competency_id: { in: compIds } },
          select: { id: true }
        })
        const rapIds = rapList.map(r => r.id)

        if (rapIds.length > 0) {
          // Desvincular actividades
          await tx.activity.updateMany({
            where: { learningOutcomeId: { in: rapIds } },
            data: { learningOutcomeId: null }
          })
          // Eliminar evaluaciones de los RAPs
          await tx.evaluation.deleteMany({
            where: { learning_outcome_id: { in: rapIds } }
          })
          // Eliminar RAPs
          await tx.learningOutcome.deleteMany({
            where: { id: { in: rapIds } }
          })
        }

        // Eliminar competencias
        await tx.competency.deleteMany({
          where: { id: { in: compIds } }
        })
      }

      // 3. Desvincular cursos vinculados a este programa
      await tx.course.updateMany({
        where: { programId },
        data: { programId: null }
      })

      // 4. Limpiar cohortes y matrículas si existieran
      const cohortList = await tx.cohort.findMany({
        where: { program_id: programId },
        select: { id: true }
      })
      const cohortIds = cohortList.map(ch => ch.id)
      if (cohortIds.length > 0) {
        await tx.enrollment.deleteMany({
          where: { cohort_id: { in: cohortIds } }
        })
        await tx.cohort.deleteMany({
          where: { id: { in: cohortIds } }
        })
      }

      // 5. Eliminar el programa
      await tx.trainingProgram.delete({
        where: { id: programId }
      })
    })

    res.json({ message: 'Programa y sus dependencias curriculares eliminados correctamente.' })
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
      },
      orderBy: { id: 'asc' }
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
        code: code.trim(),
        name: name.trim(),
        program_id: parseInt(String(finalProgramId))
      }
    })
    res.status(201).json(created)
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(400).json({ message: `El código de competencia "${req.body?.code}" ya está en uso. Debe ser único.` })
      return
    }
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
        code: code.trim(),
        name: name.trim(),
        program_id: parseInt(String(finalProgramId))
      }
    })
    res.json(updated)
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(400).json({ message: `El código de competencia "${req.body?.code}" ya está en uso. Debe ser único.` })
      return
    }
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al actualizar competencia.', error: errorObj.message })
  }
}

export async function deleteCompetency(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const compId = parseInt(req.params.id)
    if (isNaN(compId)) {
      res.status(400).json({ message: 'ID de competencia inválido.' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // Obtener RAPs de esta competencia
      const rapList = await tx.learningOutcome.findMany({
        where: { competency_id: compId },
        select: { id: true }
      })
      const rapIds = rapList.map(r => r.id)

      if (rapIds.length > 0) {
        // Desvincular actividades
        await tx.activity.updateMany({
          where: { learningOutcomeId: { in: rapIds } },
          data: { learningOutcomeId: null }
        })
        // Eliminar evaluaciones
        await tx.evaluation.deleteMany({
          where: { learning_outcome_id: { in: rapIds } }
        })
        // Eliminar RAPs
        await tx.learningOutcome.deleteMany({
          where: { id: { in: rapIds } }
        })
      }

      // Eliminar la competencia
      await tx.competency.delete({
        where: { id: compId }
      })
    })

    res.json({ message: 'Competencia y sus RAPs asociados eliminados correctamente.' })
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
      },
      orderBy: { id: 'asc' }
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
        code: code.trim(),
        name: name.trim(),
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
        code: code.trim(),
        name: name.trim(),
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
    const rapId = parseInt(req.params.id)
    if (isNaN(rapId)) {
      res.status(400).json({ message: 'ID de RAP inválido.' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // Desvincular actividades
      await tx.activity.updateMany({
        where: { learningOutcomeId: rapId },
        data: { learningOutcomeId: null }
      })
      // Eliminar evaluaciones para este RAP
      await tx.evaluation.deleteMany({
        where: { learning_outcome_id: rapId }
      })
      // Eliminar el RAP
      await tx.learningOutcome.delete({
        where: { id: rapId }
      })
    })

    res.json({ message: 'Resultado de Aprendizaje (RAP) eliminado correctamente.' })
  } catch (err: unknown) {
    const errorObj = err as Error
    res.status(500).json({ message: 'Error al eliminar RAP.', error: errorObj.message })
  }
}
