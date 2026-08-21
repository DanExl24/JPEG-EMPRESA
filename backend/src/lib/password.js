import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string') {
    return false
  }

  // Fallback if stored in plain text
  if (password === storedHash) {
    return true
  }

  if (!storedHash.includes(':')) {
    return false
  }

  try {
    const [salt, originalHash] = storedHash.split(':')
    if (!salt || !originalHash) {
      return false
    }

    const derivedHash = scryptSync(password, salt, KEY_LENGTH)
    const originalBuffer = Buffer.from(originalHash, 'hex')

    if (derivedHash.length !== originalBuffer.length) {
      return false
    }

    return timingSafeEqual(derivedHash, originalBuffer)
  } catch (err) {
    console.error('Error al verificar hash de contraseña:', err)
    return false
  }
}
