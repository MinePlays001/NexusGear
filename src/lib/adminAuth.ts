// Admin credentials - hardcoded for security (no backend needed)
const ADMIN_USERNAME = 'Furqan'
const ADMIN_PASSWORD = 'Muggy122%%'
const SESSION_KEY = 'gm_admin_session'

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Store session with timestamp
    const session = { authenticated: true, timestamp: Date.now() }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  }
  return false
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAdminAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw)
    // Session expires after 8 hours
    const eightHours = 8 * 60 * 60 * 1000
    if (Date.now() - session.timestamp > eightHours) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }
    return session.authenticated === true
  } catch {
    return false
  }
}
