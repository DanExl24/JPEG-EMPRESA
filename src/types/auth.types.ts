export type {
  UserRole,
  UserRoleUpper,
  UserRoleLower,
  AuthUserDto as AuthUser,
  LoginCredentialsDto as LoginCredentials,
  RegisterPayloadDto as RegisterPayload,
  LoginResponseDto as LoginResponse,
  AuthApiResponseDto as AuthApiResponse,
} from '../../shared/types/auth.shared.js'

/**
 * Estado del formulario de Login en Vue
 */
export interface LoginFormState {
  identifier: string
  password: string
  remember: boolean
}

/**
 * Estado de interacción de los campos
 */
export interface FormTouchedState {
  identifier: boolean
  password: boolean
}

/**
 * Error personalizado de autenticación
 */
export interface AuthCustomError extends Error {
  status?: number
  isLockout?: boolean
  isConflict?: boolean
}
