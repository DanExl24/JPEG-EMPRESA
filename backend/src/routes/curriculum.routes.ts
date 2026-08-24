import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  getPrograms, createProgram, updateProgram, deleteProgram,
  getCompetencies, createCompetency, updateCompetency, deleteCompetency,
  getRaps, createRap, updateRap, deleteRap
} from '../controllers/curriculum.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)

// Middleware to allow only admins or instructors
const requireAdminOrInstructor = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'INSTRUCTOR') {
    next()
    return
  }
  res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador o Instructor.' })
}

router.use(requireAdminOrInstructor)

// Programs/Levels
router.get('/programs', getPrograms)
router.post('/programs', createProgram)
router.put('/programs/:id', updateProgram)
router.delete('/programs/:id', deleteProgram)

// Competencies
router.get('/competencies', getCompetencies)
router.post('/competencies', createCompetency)
router.put('/competencies/:id', updateCompetency)
router.delete('/competencies/:id', deleteCompetency)

// RAPs / Learning Outcomes
router.get('/raps', getRaps)
router.post('/raps', createRap)
router.put('/raps/:id', updateRap)
router.delete('/raps/:id', deleteRap)

export default router
