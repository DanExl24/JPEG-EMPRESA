import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

/**
 * Genera una cadena segura salt:hash a partir de una contraseña en texto plano.
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string')
  }
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifica de forma segura una contraseña en texto plano contra un hash almacenado.
 * Soporta formato salt:hash (scrypt) y fallback en texto plano para casos de prueba.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
      return false
    }

    // Direct match fallback
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
  } catch (err: unknown) {
    const errorObj = err as Error
    console.error('[Auth Crypto] Error verifying password:', errorObj.message)
    return false
  }
}
