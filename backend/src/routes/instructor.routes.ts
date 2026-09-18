import { Router } from 'express'
import { getInstructorCohorts } from '../controllers/instructor.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Fichas a cargo del instructor
router.get('/cohorts', authenticate, requireRole('INSTRUCTOR'), getInstructorCohorts)

export default router
