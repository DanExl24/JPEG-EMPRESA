export interface LoginDto {
  identifier: string
  password: string
  remember?: boolean
}

export interface RegisterDto {
  nombre: string
  apellido: string
  cedula: string
  correo: string
  password: string
  rol?: string
  document_type?: string
}

export interface RecoverPasswordDto {
  correo: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export interface AuthUserPayload {
  id: number
  cedula: string
  correo: string | null
  role: string
  nombre?: string
  apellido?: string
}

export interface JwtTokenPayload {
  id: number
  cedula: string
  correo: string | null
  role: string
}

export interface AuthSuccessResponse {
  token: string
  user: {
    id: number
    nombre: string
    apellido: string
    cedula: string
    correo: string | null
    role: string
  }
}
