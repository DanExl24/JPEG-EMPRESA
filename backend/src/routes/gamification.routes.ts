import { Router } from 'express'
import { GamificationController } from '../controllers/gamification.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)

// Insignias y logros para el usuario actual (LogrosView.vue aprendiz)
router.get('/badges', GamificationController.getBadges)

// CRUD Administrativo de Insignias y Logros
router.get('/admin/badges', requireRole('ADMIN', 'INSTRUCTOR'), GamificationController.listBadgesAdmin)
router.post('/admin/badges', requireRole('ADMIN'), GamificationController.createBadge)
router.put('/admin/badges/:id', requireRole('ADMIN'), GamificationController.updateBadge)
router.delete('/admin/badges/:id', requireRole('ADMIN'), GamificationController.deleteBadge)

// Resumen administrativo de juegos y partidas (JuegosView.vue admin)
router.get('/admin/games-overview', GamificationController.getAdminGamesOverview)

// CRUD Administrativo de Juegos del Arcade
router.post('/admin/games', GamificationController.createArcadeGame)
router.put('/admin/games/:id', GamificationController.updateArcadeGame)
router.delete('/admin/games/:id', GamificationController.deleteArcadeGame)
router.patch('/admin/games/:id/toggle', GamificationController.toggleArcadeGame)

// Contenido dinámico para los minijuegos del Arcade (preguntas, vocabulario, pares)
router.get('/arcade/content', GamificationController.getArcadeContent)

// Registro de partidas de mini-juegos y suma de XP (JuegosView.vue)
router.post('/games/score', GamificationController.recordGameScore)

// Progreso general y por curso (ProgresoView.vue)
router.get('/progress', GamificationController.getProgress)

// Tabla de clasificación / Leaderboard (RankingView.vue)
router.get('/leaderboard', GamificationController.getLeaderboard)

export default router
