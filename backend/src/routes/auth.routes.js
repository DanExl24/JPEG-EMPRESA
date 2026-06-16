import { Router } from 'express'
import { login, register, recover, resetPassword } from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/recover', recover)
router.post('/reset-password', resetPassword)

export default router
