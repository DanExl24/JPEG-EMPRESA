export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud incorrecta o parámetros inválidos.') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado. Token no proporcionado o inválido.') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado. Permisos insuficientes.') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado.') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con recurso existente (cédula o correo duplicado).') {
    super(message, 409)
  }
}

export class LockedError extends AppError {
  constructor(message: string = 'Cuenta bloqueada temporalmente por intentos fallidos.') {
    super(message, 423)
  }
}
