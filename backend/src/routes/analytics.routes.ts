import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Resumen del dashboard (para el usuario conectado)
router.get('/dashboard/summary', authenticate, AnalyticsController.getDashboardSummary)

// Métricas de analíticas globales (Solo Admin)
router.get('/admin/analytics', authenticate, requireRole('ADMIN'), AnalyticsController.getAnalytics)

export default router
