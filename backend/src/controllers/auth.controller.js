import prisma from '../lib/db.js'
import { verifyPassword } from '../lib/password.js'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS  = 2 * 60 * 60 * 1000 // 2 horas

// ────────────────────────────────────────────────────
// Helpers de payload
// ────────────────────────────────────────────────────
function buildAuthPayload(user) {
  return {
    id:    user.id,
    name:  user.fullName,
    email: user.email,
    role:  user.role,
  }
}

function buildApprenticePayload(apprentice) {
  const nameParts = [
    apprentice.first_name,
    apprentice.middle_name,
    apprentice.last_name,
    apprentice.second_last_name,
  ].filter(Boolean)

  return {
    id:             apprentice.id,
    name:           nameParts.join(' '),
    email:          `Documento ${apprentice.document_number}`,
    role:           'aprendiz',
    documentNumber: apprentice.document_number,
  }
}

// ────────────────────────────────────────────────────
// Helpers de bloqueo
// ────────────────────────────────────────────────────
function isLocked(lockedUntil) {
  return lockedUntil && new Date(lockedUntil) > new Date()
}

function lockoutTimeRemaining(lockedUntil) {
  const remainingMs = new Date(lockedUntil) - new Date()
  const minutes = Math.ceil(remainingMs / 60000)
  return minutes
}

// Incrementa el contador de intentos fallidos y bloquea si llega al máximo.
async function registerFailedAttempt(model, where) {
  const record = await prisma[model].findUnique({ where })
  if (!record) return

  const newCount = (record.failedAttempts ?? 0) + 1
  const data     = { failedAttempts: newCount }

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
  }

  await prisma[model].update({ where, data })
}

// Resetea el contador tras login exitoso.
async function resetFailedAttempts(model, where) {
  await prisma[model].update({
    where,
    data: { failedAttempts: 0, lockedUntil: null },
  })
}

// ────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────
export async function login(req, res) {
  const rawIdentifier = req.body?.identifier ?? req.body?.email ?? ''
  const identifier    = rawIdentifier.trim()
  const password      = req.body?.password ?? ''

  if (!identifier || !password) {
    return res.status(400).json({
      message: 'Usuario y contraseña son obligatorios.',
    })
  }

  const email = identifier.toLowerCase()

  // ── 1. Buscar en AuthUser (admin / instructor) ─────
  const user = await prisma.authUser.findUnique({ where: { email } })

  if (user) {
    // Verificar bloqueo
    if (isLocked(user.lockedUntil)) {
      const mins = lockoutTimeRemaining(user.lockedUntil)
      return res.status(423).json({
        message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${mins} minuto(s).`,
        lockedUntilMinutes: mins,
      })
    }

    if (verifyPassword(password, user.passwordHash)) {
      await resetFailedAttempts('authUser', { email })
      return res.json({ user: buildAuthPayload(user) })
    }

    // Contraseña incorrecta → registrar intento fallido
    await registerFailedAttempt('authUser', { email })

    // Si ahora quedó bloqueado, informarlo
    const updated = await prisma.authUser.findUnique({ where: { email } })
    if (isLocked(updated?.lockedUntil)) {
      const mins = lockoutTimeRemaining(updated.lockedUntil)
      return res.status(423).json({
        message: `Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta de nuevo en ${mins} minuto(s).`,
        lockedUntilMinutes: mins,
      })
    }

    return res.status(401).json({ message: 'Credenciales inválidas.' })
  }

  // ── 2. Buscar en Apprentice (por número de documento) ──
  const apprentice = await prisma.apprentice.findUnique({
    where: { document_number: identifier },
  })

  if (apprentice) {
    // Verificar bloqueo
    if (isLocked(apprentice.lockedUntil)) {
      const mins = lockoutTimeRemaining(apprentice.lockedUntil)
      return res.status(423).json({
        message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${mins} minuto(s).`,
        lockedUntilMinutes: mins,
      })
    }

    if (apprentice.passwordHash && verifyPassword(password, apprentice.passwordHash)) {
      await resetFailedAttempts('apprentice', { document_number: identifier })
      return res.json({ user: buildApprenticePayload(apprentice) })
    }

    // Contraseña incorrecta (o sin hash) → registrar intento fallido
    await registerFailedAttempt('apprentice', { document_number: identifier })

    // Si ahora quedó bloqueado, informarlo
    const updated = await prisma.apprentice.findUnique({ where: { document_number: identifier } })
    if (isLocked(updated?.lockedUntil)) {
      const mins = lockoutTimeRemaining(updated.lockedUntil)
      return res.status(423).json({
        message: `Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta de nuevo en ${mins} minuto(s).`,
        lockedUntilMinutes: mins,
      })
    }
  }

  // ── 3. Credenciales inválidas (genérico) ───────────
  return res.status(401).json({ message: 'Credenciales inválidas.' })
}
