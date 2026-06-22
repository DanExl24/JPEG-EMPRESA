import { Router } from 'express'
import {
  getActivities,
  getMySubmissions,
  getActivityById,
  submitActivity,
  createActivity,
  updateActivity,
  deleteActivity
} from '../controllers/activity.controller.js'

const router = Router()

router.get('/', getActivities)
router.get('/my-submissions', getMySubmissions)
router.get('/:id', getActivityById)
router.post('/', createActivity)
router.post('/:id/submit', submitActivity)
router.put('/:id', updateActivity)
router.delete('/:id', deleteActivity)

export default router
