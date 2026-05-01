'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Product, Client, Sale, User, AuditInfo, UserRole } from './types'

interface StoreContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'audit'>, auditInfo: { userName: string; userRole: UserRole }) => void
  updateClient: (id: string, client: Partial<Omit<Client, 'audit'>>, auditInfo: { userName: string; userRole: UserRole }) => void
  deleteClient: (id: string) => void
  
  users: User[]
  addUser: (user: Omit<User, 'id'> & { password: string }) => void
  deleteUser: (id: string) => void
  
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id'>) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const initialProducts: Product[] = [
  { id: '1', name: 'Papas Fritas', price: 15, category: 'snacks' },
  { id: '2', name: 'Galletas', price: 10, category: 'snacks' },
  { id: '3', name: 'Coca-Cola', price: 12, category: 'refrescos' },
  { id: '4', name: 'Sprite', price: 12, category: 'refrescos' },
  { id: '5', name: 'Agua Mineral', price: 8, category: 'refrescos' },
  { id: '6', name: 'Marlboro', price: 45, category: 'cigarros' },
  { id: '7', name: 'Lucky Strike', price: 40, category: 'cigarros' },
  { id: '8', name: 'Desayuno Continental', price: 35, category: 'desayuno' },
  { id: '9', name: 'Huevos con Tocino', price: 30, category: 'desayuno' },
  { id: '10', name: 'Almuerzo Ejecutivo', price: 45, category: 'almuerzo' },
  { id: '11', name: 'Pollo a la Plancha', price: 40, category: 'almuerzo' },
  { id: '12', name: 'Cena Ligera', price: 35, category: 'cena' },
  { id: '13', name: 'Sandwich Club', price: 28, category: 'cena' },
]

const initialClients: Client[] = [
  { id: '1', code: 'EMP001', fullName: 'María García López', position: 'Contabilidad', audit: { createdBy: 'Administrador', createdByRole: 'admin', createdAt: new Date('2024-01-15') } },
  { id: '2', code: 'EMP002', fullName: 'Carlos Rodríguez Pérez', position: 'Recursos Humanos', audit: { createdBy: 'Administrador', createdByRole: 'admin', createdAt: new Date('2024-01-15') } },
  { id: '3', code: 'EMP003', fullName: 'Ana Martínez Silva', position: 'Sistemas', audit: { createdBy: 'Administrador', createdByRole: 'admin', createdAt: new Date('2024-01-15') } },
  { id: '4', code: 'EMP004', fullName: 'Luis Hernández Cruz', position: 'Operaciones', audit: { createdBy: 'Administrador', createdByRole: 'admin', createdAt: new Date('2024-01-15') } },
  { id: '5', code: 'EMP005', fullName: 'Patricia Sánchez Mora', position: 'Ventas', audit: { createdBy: 'Administrador', createdByRole: 'admin', createdAt: new Date('2024-01-15') } },
]

const initialUsers: User[] = [
  { id: '1', username: 'admin', name: 'Administrador', role: 'admin' },
  { id: '2', username: 'cajero', name: 'Juan Pérez', role: 'cajero' },
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [sales, setSales] = useState<Sale[]>([])

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { ...product, id: crypto.randomUUID() }])
  }

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const addClient = (client: Omit<Client, 'id' | 'audit'>, auditInfo: { userName: string; userRole: UserRole }) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      audit: {
        createdBy: auditInfo.userName,
        createdByRole: auditInfo.userRole,
        createdAt: new Date(),
      },
    }
    setClients([...clients, newClient])
  }

  const updateClient = (id: string, client: Partial<Omit<Client, 'audit'>>, auditInfo: { userName: string; userRole: UserRole }) => {
    setClients(clients.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...client,
          audit: {
            ...c.audit!,
            updatedBy: auditInfo.userName,
            updatedByRole: auditInfo.userRole,
            updatedAt: new Date(),
          },
        }
      }
      return c
    }))
  }

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id))
  }

  const addUser = (user: Omit<User, 'id'> & { password: string }) => {
    const { password, ...userData } = user
    setUsers([...users, { ...userData, id: crypto.randomUUID() }])
  }

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const addSale = (sale: Omit<Sale, 'id'>) => {
    setSales([...sales, { ...sale, id: crypto.randomUUID() }])
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        clients,
        addClient,
        updateClient,
        deleteClient,
        users,
        addUser,
        deleteUser,
        sales,
        addSale,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
