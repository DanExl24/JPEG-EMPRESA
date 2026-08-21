import prisma from '../lib/db.js'
import { verifyPassword, hashPassword } from '../lib/password.js'
import jwt from 'jsonwebtoken'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 2 * 60 * 60 * 1000 // 2 horas
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Helpers
function isLocked(lockedUntil) {
  return Boolean(lockedUntil && new Date(lockedUntil) > new Date())
}

function lockoutTimeRemaining(lockedUntil) {
  if (!lockedUntil) return 0
  const diffMs = new Date(lockedUntil).getTime() - Date.now()
  return Math.max(1, Math.ceil(diffMs / 60000))
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*]/.test(password)
}

/**
 * Procesa el inicio de sesión unificado para Admin, Instructor y Aprendiz.
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body || {}

    const cleanIdentifier = typeof identifier === 'string' ? identifier.trim() : ''
    const cleanPassword = typeof password === 'string' ? password : ''

    if (!cleanIdentifier || !cleanPassword) {
      return res.status(400).json({
        message: 'Por favor ingresa tu usuario/correo y contraseña.'
      })
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
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    // Verificar si la cuenta está bloqueada
    if (isLocked(user.lockedUntil)) {
      const minutesLeft = lockoutTimeRemaining(user.lockedUntil)
      console.warn(`[Auth Login] Cuenta bloqueada para ${user.correo || user.cedula}. Minutos restantes: ${minutesLeft}`)
      return res.status(423).json({
        message: `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${minutesLeft} minutos.`
      })
    }

    // Verificar contraseña
    const passwordMatches = verifyPassword(cleanPassword, user.passwordHash)

    if (passwordMatches) {
      // Restablecer intentos fallidos
      if (user.failedAttempts > 0 || user.lockedUntil !== null) {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null }
        }).catch(err => console.error('[Auth Login] Error resetting failed attempts:', err.message))
      }

      const roleNormalized = (user.rol || 'APRENDIZ').toUpperCase()
      const token = jwt.sign(
        {
          id: user.id,
          role: roleNormalized,
          correo: user.correo,
          cedula: user.cedula
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ') || 'Usuario'

      console.log(`[Auth Login] ✅ Inicio de sesión exitoso: ${user.correo || user.cedula} (Rol: ${roleNormalized})`)

      return res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          name: fullName,
          rol: roleNormalized,
          role: roleNormalized.toLowerCase(),
          correo: user.correo,
          email: user.correo,
          cedula: user.cedula,
          xp: user.xp || 0
        }
      })
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
    }).catch(err => console.error('[Auth Login] Error incrementing failed attempts:', err.message))

    if (shouldLock) {
      console.warn(`[Auth Login] 🔒 Cuenta bloqueada por alcanzar ${MAX_FAILED_ATTEMPTS} intentos fallidos: ${cleanIdentifier}`)
      return res.status(423).json({
        message: `Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta en 2 horas.`
      })
    }

    console.warn(`[Auth Login] ❌ Contraseña incorrecta para: "${cleanIdentifier}". Intento ${nextAttempts}/${MAX_FAILED_ATTEMPTS}`)
    return res.status(401).json({ message: 'Credenciales inválidas.' })
  } catch (error) {
    console.error('[Auth Login Fatal Error]:', error)
    return res.status(500).json({
      message: 'Error interno del servidor al procesar el inicio de sesión.'
    })
  }
}

/**
 * Registro de nuevos aprendices
 */
export async function register(req, res) {
  try {
    const { nombre, apellido, cedula, correo, password } = req.body || {}
    if (!nombre || !apellido || !cedula || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener mínimo 8 caracteres, al menos 1 mayúscula y 1 carácter especial (@#$%&*).'
      })
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
        return res.status(409).json({ message: 'Estas credenciales ya existen ¿Desea recuperar la cuenta?' })
      }
      return res.status(400).json({ message: 'El usuario ya existe en el sistema.' })
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

    return res.status(201).json({ message: 'Usuario registrado exitosamente.' })
  } catch (error) {
    console.error('[Auth Register Error]:', error)
    return res.status(500).json({ message: 'Error interno al registrar usuario.' })
  }
}

/**
 * Recuperación de cuenta / contraseña
 */
export async function recover(req, res) {
  const { identifier } = req.body || {}
  if (!identifier) {
    return res.status(400).json({ message: 'Identificador requerido.' })
  }
  return res.json({
    message: 'Si el correo o documento existe en el sistema, recibirás un enlace de recuperación.'
  })
}

/**
 * Restablecer contraseña
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body || {}
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Faltan parámetros.' })
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'La nueva contraseña no cumple con los requisitos de seguridad.' })
  }

  return res.json({ message: 'Contraseña restablecida exitosamente.' })
}
