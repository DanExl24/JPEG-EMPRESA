import type { UserRoleUpper, UserRoleLower } from '../../../shared/types/auth.shared.js'

export type UserRoleBackend = UserRoleUpper

export interface JwtPayloadAuth {
  id: number
  role: UserRoleUpper
  correo?: string | null
  cedula?: string
}

export interface UserAuthDto {
  id: number
  nombre: string
  apellido: string
  name: string
  rol: UserRoleUpper
  role: UserRoleLower
  correo: string | null
  email: string | null
  cedula: string
  xp: number
}

export interface LoginRequestBody {
  identifier?: string
  password?: string
}

export interface LoginSuccessResponse {
  token: string
  user: UserAuthDto
}

export interface RegisterRequestBody {
  nombre?: string
  apellido?: string
  cedula?: string
  correo?: string
  password?: string
}

export interface MessageResponse {
  message: string
}
