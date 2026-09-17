import type { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/appError.js'

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('No autenticado. Token requerido.'))
      return
    }

    const userRole = String(req.user.role || '').toUpperCase()
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase())

    if (!normalizedAllowed.includes(userRole)) {
      next(new ForbiddenError(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`))
      return
    }

    next()
  }
}
