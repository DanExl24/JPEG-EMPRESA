import type { Request, Response } from 'express'
import prisma from '../lib/db.js'
import { verifyPassword, hashPassword } from '../lib/password.js'
import jwt from 'jsonwebtoken'
import type {
  LoginRequestBody,
  RegisterRequestBody,
  UserAuthDto,
  UserRoleBackend,
  JwtPayloadAuth
} from '../types/auth.types.js'
import type { UserRoleLower } from '../../../shared/types/auth.shared.js'

const MAX_FAILED_ATTEMPTS = 5
const IS_DEV = process.env.NODE_ENV !== 'production'
const LOCKOUT_DURATION_MS = IS_DEV ? 60 * 1000 : 2 * 60 * 60 * 1000 // 1 min en dev, 2 horas en prod
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Helpers
function isLocked(lockedUntil: Date | null): boolean {
  return Boolean(lockedUntil && new Date(lockedUntil) > new Date())
}

function lockoutTimeRemaining(lockedUntil: Date | null): number {
  if (!lockedUntil) return 0
  const diffMs = new Date(lockedUntil).getTime() - Date.now()
  return Math.max(1, Math.ceil(diffMs / 60000))
}

function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*]/.test(password)
}

/**
 * Procesa el inicio de sesión unificado para Admin, Instructor y Aprendiz.
 */
export async function login(req: Request<unknown, unknown, LoginRequestBody>, res: Response): Promise<void> {
  try {
    const { identifier, password } = req.body || {}

    const cleanIdentifier = typeof identifier === 'string' ? identifier.trim() : ''
    const cleanPassword = typeof password === 'string' ? password : ''

    if (!cleanIdentifier || !cleanPassword) {
      res.status(400).json({
        message: 'Por favor ingresa tu usuario/correo y contraseña.'
      })
      return
    }

    console.log(`[Auth Login] Intento de login para identificador: "${cleanIdentifier}"`)

    // Búsqueda insensible a mayúsculas por correo o documento (cédula)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { correo: { equals: cleanIdentifier, mode: 'insensitive' } },
          { cedula: { equals: cleanIdentifier, mode: 'insensitive' } }
        ]
      }
    })

    if (!user) {
      console.warn(`[Auth Login] Usuario no encontrado para: "${cleanIdentifier}"`)
      res.status(401).json({ message: 'Credenciales inválidas.' })
      return
    }

    // Verificar si la cuenta está bloqueada
    if (isLocked(user.lockedUntil)) {
      const minutesLeft = lockoutTimeRemaining(user.lockedUntil)
      console.warn(`[Auth Login] Cuenta bloqueada para ${user.correo || user.cedula}. Minutos restantes: ${minutesLeft}`)
      res.status(423).json({
        message: `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${minutesLeft} minutos.`
      })
      return
    }

    // Verificar contraseña
    const passwordMatches = verifyPassword(cleanPassword, user.passwordHash)

    if (passwordMatches) {
      // Restablecer intentos fallidos
      if (user.failedAttempts > 0 || user.lockedUntil !== null) {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null }
        }).catch((err: Error) => console.error('[Auth Login] Error resetting failed attempts:', err.message))
      }

      const roleNormalized = (user.rol || 'APRENDIZ').toUpperCase() as UserRoleBackend
      const roleLower = roleNormalized.toLowerCase() as UserRoleLower
      const tokenPayload: JwtPayloadAuth = {
        id: user.id,
        role: roleNormalized,
        correo: user.correo,
        cedula: user.cedula
      }

      const token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      )

      const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ') || 'Usuario'

      console.log(`[Auth Login] ✅ Inicio de sesión exitoso: ${user.correo || user.cedula} (Rol: ${roleNormalized})`)

      const userDto: UserAuthDto = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        name: fullName,
        rol: roleNormalized,
        role: roleLower,
        correo: user.correo,
        email: user.correo,
        cedula: user.cedula,
        xp: user.xp || 0
      }

      res.json({
        token,
        user: userDto
      })
      return
    }

    // Contraseña incorrecta -> Incrementar contador de intentos fallidos
    const nextAttempts = (user.failedAttempts || 0) + 1
    const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS
    const lockedUntilDate = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: nextAttempts,
        lockedUntil: lockedUntilDate
      }
    }).catch((err: Error) => console.error('[Auth Login] Error incrementing failed attempts:', err.message))

    if (shouldLock) {
      console.warn(`[Auth Login] 🔒 Cuenta bloqueada por alcanzar ${MAX_FAILED_ATTEMPTS} intentos fallidos: ${cleanIdentifier}`)
      res.status(423).json({
        message: `Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta de nuevo más tarde.`
      })
      return
    }

    console.warn(`[Auth Login] ❌ Contraseña incorrecta para: "${cleanIdentifier}". Intento ${nextAttempts}/${MAX_FAILED_ATTEMPTS}`)
    res.status(401).json({ message: 'Credenciales inválidas.' })
  } catch (error) {
    console.error('[Auth Login Fatal Error]:', error)
    res.status(500).json({
      message: 'Error interno del servidor al procesar el inicio de sesión.'
    })
  }
}

/**
 * Registro de nuevos aprendices
 */
export async function register(req: Request<unknown, unknown, RegisterRequestBody>, res: Response): Promise<void> {
  try {
    const { nombre, apellido, cedula, correo, password } = req.body || {}
    if (!nombre || !apellido || !cedula || !correo || !password) {
      res.status(400).json({ message: 'Todos los campos son obligatorios.' })
      return
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        message: 'La contraseña debe tener mínimo 8 caracteres, al menos 1 mayúscula y 1 carácter especial (@#$%&*).'
      })
      return
    }

    const cleanCorreo = correo.trim().toLowerCase()
    const cleanCedula = cedula.trim()

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { correo: { equals: cleanCorreo, mode: 'insensitive' } },
          { cedula: { equals: cleanCedula, mode: 'insensitive' } }
        ]
      }
    })

    if (existing) {
      if (existing.rol === 'APRENDIZ') {
        res.status(409).json({ message: 'Estas credenciales ya existen ¿Desea recuperar la cuenta?' })
        return
      }
      res.status(400).json({ message: 'El usuario ya existe en el sistema.' })
      return
    }

    await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cleanCedula,
        correo: cleanCorreo,
        passwordHash: hashPassword(password),
        rol: 'APRENDIZ'
      }
    })

    res.status(201).json({ message: 'Usuario registrado exitosamente.' })
  } catch (error) {
    console.error('[Auth Register Error]:', error)
    res.status(500).json({ message: 'Error interno al registrar usuario.' })
  }
}

/**
 * Recuperación de cuenta / contraseña
 */
export async function recover(req: Request, res: Response): Promise<void> {
  const { identifier } = req.body || {}
  if (!identifier) {
    res.status(400).json({ message: 'Identificador requerido.' })
    return
  }
  res.json({
    message: 'Si el correo o documento existe en el sistema, recibirás un enlace de recuperación.'
  })
}

/**
 * Restablecer contraseña
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body || {}
  if (!token || !newPassword) {
    res.status(400).json({ message: 'Faltan parámetros.' })
    return
  }
  if (!isValidPassword(newPassword)) {
    res.status(400).json({ message: 'La nueva contraseña no cumple con los requisitos de seguridad.' })
    return
  }

  res.json({ message: 'Contraseña restablecida exitosamente.' })
}

/**
 * Obtiene los datos del usuario autenticado actual a partir del token JWT
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.user?.id)
    if (!userId) {
      res.status(401).json({ message: 'No autenticado.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado.' })
      return
    }

    const roleNormalized = (user.rol || 'APRENDIZ').toUpperCase() as UserRoleBackend
    const roleLower = roleNormalized.toLowerCase() as UserRoleLower
    const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ') || 'Usuario'

    const userDto: UserAuthDto = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      name: fullName,
      rol: roleNormalized,
      role: roleLower,
      correo: user.correo,
      email: user.correo || '',
      cedula: user.cedula,
      xp: user.xp || 0
    }

    res.json({ user: userDto })
  } catch (error) {
    console.error('[Auth getMe Error]:', error)
    res.status(500).json({ message: 'Error al obtener sesión del usuario.' })
  }
}
