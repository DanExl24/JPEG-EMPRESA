import { Router } from 'express'
import { login, register, recover, resetPassword, getMe } from '../controllers/auth.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/recover', recover)
router.post('/reset-password', resetPassword)
router.get('/me', authenticate, getMe)

export default router
