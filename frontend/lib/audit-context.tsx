'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { AuditLog, AuditAction, LoginAttempt } from './audit-types'

interface AuditContextType {
  auditLogs: AuditLog[]
  loginAttempts: LoginAttempt[]
  logAction: (
    action: AuditAction,
    userId: string,
    userName: string,
    userRole: 'admin' | 'cajero',
    details: Record<string, unknown>,
    status?: 'success' | 'error',
    errorMessage?: string,
  ) => void
  recordLoginAttempt: (
    username: string,
    success: boolean,
  ) => void
  getAuditLogs: () => AuditLog[]
  getLoginAttempts: (username?: string) => LoginAttempt[]
  clearOldLogs: (daysToKeep?: number) => void
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('auditLogs')
    return stored ? JSON.parse(stored) : []
  })

  const [loginAttempts, setLoginAttempts] = React.useState<LoginAttempt[]>(
    () => {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem('loginAttempts')
      return stored ? JSON.parse(stored) : []
    },
  )

  const logAction = useCallback(
    (
      action: AuditAction,
      userId: string,
      userName: string,
      userRole: 'admin' | 'cajero',
      details: Record<string, unknown>,
      status: 'success' | 'error' = 'success',
      errorMessage?: string,
    ) => {
      const newLog: AuditLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        userId,
        userName,
        userRole,
        details,
        status,
        errorMessage,
      }

      setAuditLogs((prev) => {
        const updated = [newLog, ...prev]
        localStorage.setItem('auditLogs', JSON.stringify(updated))
        return updated
      })
    },
    [],
  )

  const recordLoginAttempt = useCallback((username: string, success: boolean) => {
    const attempt: LoginAttempt = {
      username,
      timestamp: new Date().toISOString(),
      success,
    }

    setLoginAttempts((prev) => {
      const updated = [attempt, ...prev]
      localStorage.setItem('loginAttempts', JSON.stringify(updated))
      return updated
    })
  }, [])

  const getAuditLogs = useCallback(() => auditLogs, [auditLogs])

  const getLoginAttempts = useCallback(
    (username?: string) => {
      if (!username) return loginAttempts
      return loginAttempts.filter((attempt) => attempt.username === username)
    },
    [loginAttempts],
  )

  const clearOldLogs = useCallback((daysToKeep: number = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    setAuditLogs((prev) => {
      const filtered = prev.filter(
        (log) => new Date(log.timestamp) > cutoffDate,
      )
      localStorage.setItem('auditLogs', JSON.stringify(filtered))
      return filtered
    })
  }, [])

  const value: AuditContextType = {
    auditLogs,
    loginAttempts,
    logAction,
    recordLoginAttempt,
    getAuditLogs,
    getLoginAttempts,
    clearOldLogs,
  }

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  )
}

export function useAudit() {
  const context = useContext(AuditContext)
  if (!context) {
    throw new Error('useAudit must be used within AuditProvider')
  }
  return context
}
