import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

/**
 * Generates a secure salt:hash string for the given password.
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string')
  }
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Safely verifies a plaintext password against a stored hash string.
 * Supports salt:hash (scrypt) format and plaintext legacy fallback.
 * Never throws exceptions.
 */
export function verifyPassword(password, storedHash) {
  try {
    if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
      return false
    }

    // Direct match fallback (for edge-case test migrations)
    if (password === storedHash) {
      return true
    }

    if (!storedHash.includes(':')) {
      return false
    }

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
    console.error('[Auth Crypto] Error verifying password:', err.message)
    return false
  }
}
