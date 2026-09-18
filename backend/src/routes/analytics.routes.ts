import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Resumen del dashboard (para el usuario conectado o público)
router.get('/dashboard/summary', optionalAuthenticate, AnalyticsController.getDashboardSummary)

// Métricas de analíticas adaptadas (Admin e Instructor)
router.get('/admin/analytics', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), AnalyticsController.getAnalytics)
router.get('/analytics', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), AnalyticsController.getAnalytics)

export default router
