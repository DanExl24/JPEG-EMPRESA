export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null' || envUrl.includes('localhost:3000')) {
    return ''
  }
  return envUrl.replace(/\/$/, '')
}
