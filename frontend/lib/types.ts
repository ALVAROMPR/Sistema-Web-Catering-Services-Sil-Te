export type UserRole = 'admin' | 'cajero'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
}

export interface AuditInfo {
  createdBy: string
  createdByRole: UserRole
  createdAt: Date
  updatedBy?: string
  updatedByRole?: UserRole
  updatedAt?: Date
}

export interface Product {
  id: string
  name: string
  price: number
  category: 'snacks' | 'refrescos' | 'cigarros' | 'desayuno' | 'almuerzo' | 'cena'
}

export interface Client {
  id: string
  code: string
  fullName: string
  position: string
  audit?: AuditInfo
}

export interface SaleItem {
  product: Product
  quantity: number
}

export interface Sale {
  id: string
  clientId: string
  clientName: string
  items: SaleItem[]
  total: number
  date: Date
  registeredBy: string
  registeredByRole: UserRole
}

export interface MonthlyReport {
  clientId: string
  clientName: string
  clientCode: string
  totalConsumed: number
  sales: Sale[]
}
