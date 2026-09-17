import { Router } from 'express'
import { GamificationController } from '../controllers/gamification.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)

// Insignias y logros (LogrosView.vue)
router.get('/badges', GamificationController.getBadges)

// Resumen administrativo de juegos y partidas (JuegosView.vue admin)
router.get('/admin/games-overview', GamificationController.getAdminGamesOverview)

// Registro de partidas de mini-juegos y suma de XP (JuegosView.vue)
router.post('/games/score', GamificationController.recordGameScore)

// Progreso general y por curso (ProgresoView.vue)
router.get('/progress', GamificationController.getProgress)

// Tabla de clasificación / Leaderboard (RankingView.vue)
router.get('/leaderboard', GamificationController.getLeaderboard)

export default router
