import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/appError.js'

export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production'

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(isDev ? { stack: err.stack } : {})
    })
    return
  }

  // Handle Prisma unique constraint error
  if ('code' in err && err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos únicos (cédula, correo o código duplicado).'
    })
    return
  }

  // Handle Prisma record not found error
  if ('code' in err && err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'El registro solicitado no fue encontrado en la base de datos.'
    })
    return
  }

  console.error(`💥 [Unhandled Error in ${req.method} ${req.originalUrl || req.url}]:`, err)

  res.status(500).json({
    success: false,
    message: 'Error interno en el servidor.',
    ...(isDev ? { error: err.message, stack: err.stack } : {})
  })
}
