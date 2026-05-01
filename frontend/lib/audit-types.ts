'use client'

export type AuditAction =
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_CLIENT'
  | 'UPDATE_CLIENT'
  | 'DELETE_CLIENT'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_SALE'
  | 'IMPORT_CLIENTS'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'

export interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  userId: string
  userName: string
  userRole: 'admin' | 'cajero'
  details: Record<string, unknown>
  ipAddress?: string
  status: 'success' | 'error'
  errorMessage?: string
}

export interface LoginAttempt {
  username: string
  timestamp: string
  success: boolean
  ipAddress?: string
}
