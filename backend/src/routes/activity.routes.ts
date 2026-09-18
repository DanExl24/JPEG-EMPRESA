import { Router } from 'express'
import {
  getActivities,
  getMySubmissions,
  getActivityById,
  submitActivity,
  getActivitySubmissions,
  exportSubmissionsCsv,
  reviewSubmission,
  createActivity,
  updateActivity,
  reorderActivities,
  deleteActivity
} from '../controllers/activity.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.get('/', optionalAuthenticate, getActivities)
router.get('/my-submissions', optionalAuthenticate, getMySubmissions)
router.get('/:id', optionalAuthenticate, getActivityById)
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createActivity)
router.post('/:id/submit', optionalAuthenticate, submitActivity)
router.get('/:id/submissions/export-csv', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), exportSubmissionsCsv)
router.get('/:id/submissions', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), getActivitySubmissions)
router.patch('/:id/submissions/:apprenticeId/review', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), reviewSubmission)
router.put('/reorder', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), reorderActivities)
router.put('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateActivity)
router.delete('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteActivity)

export default router
