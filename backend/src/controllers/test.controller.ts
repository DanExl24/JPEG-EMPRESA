import type { Request, Response } from 'express'

export const getTest = (_req: Request, res: Response): void => {
  res.json({
    message: 'Todo funcionando 🚀',
    timestamp: new Date()
  })
}
