import { Router } from 'express'
import { getInstructorCohorts } from '../controllers/instructor.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Fichas a cargo del instructor (y auditoría para admin)
router.get('/cohorts', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), getInstructorCohorts)

export default router
