/**
 * Retorna la URL base de la API backend de forma estrictamente tipada.
 */
export function getApiBaseUrl(): string {
  const envUrl: string | undefined = import.meta.env.VITE_API_URL
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null' || envUrl.includes('localhost:3000')) {
    return ''
  }
  return envUrl.replace(/\/$/, '')
}
