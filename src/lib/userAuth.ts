// User authentication system with localStorage
const USERS_KEY = 'gm_users'
const SESSION_KEY = 'gm_user_session'

export interface User {
  email: string
  password: string
  name: string
  createdAt: number
}

export interface UserSession {
  email: string
  name: string
  timestamp: number
}

// Get all users from localStorage
function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save users to localStorage
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Register new user
export function registerUser(email: string, password: string, name: string): { success: boolean; message: string } {
  const users = getUsers()
  
  // Check if email already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Email already registered' }
  }
  
  // Validate password (minimum 6 characters, must have number and special char)
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' }
  }
  if (!/\d/.test(password)) {
    return { success: false, message: 'Password must contain at least one number' }
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { success: false, message: 'Password must contain at least one special character' }
  }
  
  const newUser: User = {
    email,
    password, // In production, this should be hashed!
    name,
    createdAt: Date.now()
  }
  
  users.push(newUser)
  saveUsers(users)
  
  return { success: true, message: 'Registration successful' }
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; message: string } {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' }
  }
  
  // Create session
  const session: UserSession = {
    email: user.email,
    name: user.name,
    timestamp: Date.now()
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  
  return { success: true, message: 'Login successful' }
}

// Logout user
export function logoutUser(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

// Check if user is authenticated
export function isUserAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session: UserSession = JSON.parse(raw)
    // Session expires after 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000
    if (Date.now() - session.timestamp > twentyFourHours) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

// Get current user session
export function getCurrentUser(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
