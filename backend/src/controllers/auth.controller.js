import prisma from '../lib/db.js'
import { verifyPassword, hashPassword } from '../lib/password.js'
import jwt from 'jsonwebtoken'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS  = 2 * 60 * 60 * 1000 // 2 horas
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

// Helpers
function isLocked(lockedUntil) {
  return lockedUntil && new Date(lockedUntil) > new Date()
}
function lockoutTimeRemaining(lockedUntil) {
  return Math.ceil((new Date(lockedUntil) - new Date()) / 60000)
}

function isValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*]/.test(password);
}

export async function login(req, res) {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' })

  const user = await prisma.user.findFirst({
    where: { OR: [{ correo: identifier }, { cedula: identifier }] }
  })

  if (!user) return res.status(401).json({ message: 'Credenciales inválidas.' })

  if (isLocked(user.lockedUntil)) {
    return res.status(423).json({ message: `Cuenta bloqueada. Intenta en ${lockoutTimeRemaining(user.lockedUntil)} minutos.` })
  }

  if (verifyPassword(password, user.passwordHash)) {
    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } })
    const token = jwt.sign({ id: user.id, role: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return res.json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, rol: user.rol, correo: user.correo, cedula: user.cedula } })
  }

  const newCount = user.failedAttempts + 1
  const lockedUntil = newCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null
  await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: newCount, lockedUntil } })

  if (lockedUntil) {
    return res.status(423).json({ message: `Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos.` })
  }

  res.status(401).json({ message: 'Credenciales inválidas.' })
}

export async function register(req, res) {
  const { nombre, apellido, cedula, correo, password } = req.body;
  if (!nombre || !apellido || !cedula || !correo || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'La contraseña no cumple los requisitos. Mínimo 8 caracteres, 1 mayúscula y 1 carácter especial (@#$%&*).' })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ correo }, { cedula }] }
  })

  if (existing) {
    if (existing.rol === 'APRENDIZ') {
      return res.status(409).json({ message: 'Estas credenciales ya existen ¿Desea recuperar la cuenta?' })
    }
    return res.status(400).json({ message: 'El usuario ya existe en el sistema.' })
  }

  const user = await prisma.user.create({
    data: { nombre, apellido, cedula, correo, passwordHash: hashPassword(password), rol: 'APRENDIZ' }
  })

  res.status(201).json({ message: 'Usuario registrado exitosamente.' })
}

export async function recover(req, res) {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ message: 'Identificador requerido.' })
  
  // Mock recovery implementation as requested
  res.json({ message: 'Si el correo existe en el sistema, recibirás un enlace de recuperación.' })
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Faltan parámetros.' })
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'La contraseña no cumple los requisitos.' })
  }

  // Mock implementation
  res.json({ message: 'Contraseña restablecida exitosamente.' })
}
