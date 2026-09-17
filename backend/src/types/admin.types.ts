export interface CreateUserAdminDto {
  nombre: string
  apellido: string
  cedula: string
  correo: string
  password: string
  rol: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ'
}

export interface UpdateUserAdminDto {
  nombre?: string
  apellido?: string
  correo?: string
  rol?: 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ'
  active?: boolean
}

export interface UserSummaryDto {
  id: number
  nombre: string
  apellido: string
  cedula: string
  correo: string | null
  rol: string
  xp: number
  createdAt: Date
}
