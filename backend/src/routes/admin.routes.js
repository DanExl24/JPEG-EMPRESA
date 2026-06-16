import { Router } from 'express'
import { createUser, listUsers } from '../controllers/admin.controller.js'
import { authenticate, requireRole } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)
router.use(requireRole('ADMIN'))

router.post('/users', createUser)
router.get('/users', listUsers)

export default router
