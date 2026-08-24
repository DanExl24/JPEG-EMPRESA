import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayloadAuth } from '../types/auth.types.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autenticado.' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadAuth
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' })
    return
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role.toUpperCase()) {
      res.status(403).json({ message: 'No autorizado para esta acción.' })
      return
    }
    next()
  }
}
