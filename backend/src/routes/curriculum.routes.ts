import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  getPrograms, createProgram, updateProgram, deleteProgram,
  getCompetencies, createCompetency, updateCompetency, deleteCompetency,
  getRaps, createRap, updateRap, deleteRap,
  getCohorts, createCohort, updateCohort, deleteCohort
} from '../controllers/curriculum.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Programs/Levels
router.get('/programs', optionalAuthenticate, getPrograms)
router.post('/programs', authenticate, requireRole('ADMIN'), createProgram)
router.put('/programs/:id', authenticate, requireRole('ADMIN'), updateProgram)
router.delete('/programs/:id', authenticate, requireRole('ADMIN'), deleteProgram)

// Competencies
router.get('/competencies', optionalAuthenticate, getCompetencies)
router.post('/competencies', authenticate, requireRole('ADMIN'), createCompetency)
router.put('/competencies/:id', authenticate, requireRole('ADMIN'), updateCompetency)
router.delete('/competencies/:id', authenticate, requireRole('ADMIN'), deleteCompetency)

// RAPs / Learning Outcomes
router.get('/raps', optionalAuthenticate, getRaps)
router.post('/raps', authenticate, requireRole('ADMIN'), createRap)
router.put('/raps/:id', authenticate, requireRole('ADMIN'), updateRap)
router.delete('/raps/:id', authenticate, requireRole('ADMIN'), deleteRap)

// Fichas / Cohortes
router.get('/cohorts', optionalAuthenticate, getCohorts)
router.post('/cohorts', authenticate, requireRole('ADMIN'), createCohort)
router.put('/cohorts/:id', authenticate, requireRole('ADMIN'), updateCohort)
router.delete('/cohorts/:id', authenticate, requireRole('ADMIN'), deleteCohort)

export default router
