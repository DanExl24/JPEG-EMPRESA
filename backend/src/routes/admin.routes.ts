import { Router } from 'express'
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  getPreferences,
  updatePreferences
} from '../controllers/admin.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)

// Preferencias de usuario (disponible para el usuario autenticado)
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)

// Gestión de usuarios (Exclusivo Administrador)
router.use(requireRole('ADMIN'))

router.get('/users', listUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

export default router
