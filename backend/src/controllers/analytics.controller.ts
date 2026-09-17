import type { Request, Response, NextFunction } from 'express'
import { AnalyticsService } from '../services/analytics.service.js'
import { ApiResponse } from '../utils/apiResponse.js'

export class AnalyticsController {
  static async getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getAnalytics()
      res.json(data)
    } catch (error) {
      next(error)
    }
  }

  static async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id ? Number(req.user.id) : undefined
      const data = await AnalyticsService.getDashboardSummary(userId)
      res.json(data)
    } catch (error) {
      next(error)
    }
  }
}
