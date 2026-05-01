'use client'

import { AuthProvider, useAuth } from '@/lib/auth-context'
import { StoreProvider } from '@/lib/store-context'
import { ThemeProvider } from '@/lib/theme-context'
import { LoginForm } from '@/components/login-form'
import { DashboardLayout } from '@/components/dashboard-layout'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <DashboardLayout />
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
