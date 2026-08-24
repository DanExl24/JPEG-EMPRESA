import type { JwtPayloadAuth } from './auth.types.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadAuth
    }
  }
}

export {}
