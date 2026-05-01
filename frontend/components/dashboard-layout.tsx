'use client'

import { useState } from 'react'
import { DashboardSidebar, MobileMenuButton } from './dashboard-sidebar'
import { DashboardSection } from './sections/dashboard-section'
import { ProductsSection } from './sections/products-section'
import { UsersSection } from './sections/users-section'
import { ClientsSection } from './sections/clients-section'
import { SalesSection } from './sections/sales-section'
import { ReportsSection } from './sections/reports-section'
import { AuditSection } from './sections/audit-section'
import { Utensils } from 'lucide-react'

type MenuSection = 'dashboard' | 'products' | 'users' | 'clients' | 'sales' | 'reports' | 'audit'

const sectionTitles: Record<MenuSection, string> = {
  dashboard: 'Dashboard',
  products: 'Gestión de Productos',
  users: 'Gestión de Usuarios',
  clients: 'Gestión de Clientes',
  sales: 'Registro de Ventas',
  reports: 'Reportes y Planillas',
  audit: 'Auditoría del Sistema',
}

export function DashboardLayout() {
  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'products':
        return <ProductsSection />
      case 'users':
        return <UsersSection />
      case 'clients':
        return <ClientsSection />
      case 'sales':
        return <SalesSection />
      case 'reports':
        return <ReportsSection />
      case 'audit':
        return <AuditSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card">
          <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-sm sm:text-base">SIL&TE</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page title for desktop */}
        <header className="hidden lg:block p-4 md:p-6 border-b border-border bg-card/50">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{sectionTitles[activeSection]}</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Mobile page title */}
            <h1 className="lg:hidden text-lg sm:text-xl font-bold text-foreground mb-4">
              {sectionTitles[activeSection]}
            </h1>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
