import type { Request, Response, NextFunction } from 'express'
import { GamificationService } from '../services/gamification.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { UnauthorizedError } from '../utils/appError.js'

export class GamificationController {
  static async getBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.user?.id)
      if (!userId) throw new UnauthorizedError()

      const badges = await GamificationService.getBadges(userId)
      ApiResponse.success(res, badges)
    } catch (error) {
      next(error)
    }
  }

  static async recordGameScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.user?.id)
      if (!userId) throw new UnauthorizedError()

      const result = await GamificationService.recordGameScore(userId, req.body)
      ApiResponse.success(res, result, 'Puntuación y XP registrados exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.user?.id)
      if (!userId) throw new UnauthorizedError()

      const progress = await GamificationService.getProgress(userId)
      ApiResponse.success(res, progress)
    } catch (error) {
      next(error)
    }
  }

  static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id ? Number(req.user.id) : undefined
      const leaderboard = await GamificationService.getLeaderboard(currentUserId)
      ApiResponse.success(res, leaderboard)
    } catch (error) {
      next(error)
    }
  }

  static async getAdminGamesOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await GamificationService.getAdminGamesOverview()
      ApiResponse.success(res, overview)
    } catch (error) {
      next(error)
    }
  }

  static async getArcadeContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const content = await GamificationService.getArcadeContent()
      ApiResponse.success(res, content)
    } catch (error) {
      next(error)
    }
  }

  static async createArcadeGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const game = await GamificationService.createArcadeGame(req.body)
      ApiResponse.created(res, game, 'Juego creado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async updateArcadeGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      const game = await GamificationService.updateArcadeGame(id, req.body)
      ApiResponse.success(res, game, 'Juego actualizado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async deleteArcadeGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      await GamificationService.deleteArcadeGame(id)
      ApiResponse.success(res, null, 'Juego eliminado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async toggleArcadeGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      const game = await GamificationService.toggleArcadeGame(id)
      ApiResponse.success(res, game, `Juego ${game.active ? 'activado' : 'pausado'} exitosamente.`)
    } catch (error) {
      next(error)
    }
  }
}
