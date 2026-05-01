'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, UserRole } from './types'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers: { username: string; password: string; name: string; role: UserRole }[] = [
  { username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
  { username: 'cajero', password: 'cajero123', name: 'Juan Pérez', role: 'cajero' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    )
    if (foundUser) {
      setUser({
        id: crypto.randomUUID(),
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
      })
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
