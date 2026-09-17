import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  getPrograms, createProgram, updateProgram, deleteProgram,
  getCompetencies, createCompetency, updateCompetency, deleteCompetency,
  getRaps, createRap, updateRap, deleteRap
} from '../controllers/curriculum.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Programs/Levels
router.get('/programs', optionalAuthenticate, getPrograms)
router.post('/programs', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createProgram)
router.put('/programs/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateProgram)
router.delete('/programs/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteProgram)

// Competencies
router.get('/competencies', optionalAuthenticate, getCompetencies)
router.post('/competencies', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createCompetency)
router.put('/competencies/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateCompetency)
router.delete('/competencies/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteCompetency)

// RAPs / Learning Outcomes
router.get('/raps', optionalAuthenticate, getRaps)
router.post('/raps', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createRap)
router.put('/raps/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateRap)
router.delete('/raps/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteRap)

export default router
