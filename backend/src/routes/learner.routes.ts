import { Router } from 'express'
import { getProfile, updateProfile, getProgress, getLeaderboard } from '../controllers/learner.controller.js'
import { getPreferences, updatePreferences } from '../controllers/admin.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/progress', getProgress)
router.get('/leaderboard', getLeaderboard)
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)

export default router
