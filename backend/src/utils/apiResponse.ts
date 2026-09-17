import type { Response } from 'express'

export interface ApiResponsePayload<T = unknown> {
  success: boolean
  data?: T
  message?: string
  meta?: Record<string, unknown>
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
      message
    })
  }

  static created<T>(res: Response, data: T, message: string = 'Recurso creado exitosamente.'): void {
    res.status(201).json({
      success: true,
      data,
      message
    })
  }

  static noContent(res: Response): void {
    res.status(204).send()
  }

  static error(res: Response, message: string, statusCode: number = 500, details?: unknown): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: details
    })
  }
}
