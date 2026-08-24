import { Router } from 'express'
import { getProfile, updateProfile, getProgress, getLeaderboard } from '../controllers/learner.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/progress', getProgress)
router.get('/leaderboard', getLeaderboard)

export default router
