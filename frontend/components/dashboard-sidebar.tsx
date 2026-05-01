'use client'

import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Package,
  Users,
  UserCog,
  ShoppingCart,
  FileText,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Utensils,
  Shield,
} from 'lucide-react'

type MenuSection = 'dashboard' | 'products' | 'users' | 'clients' | 'sales' | 'reports' | 'audit'

interface SidebarProps {
  activeSection: MenuSection
  onSectionChange: (section: MenuSection) => void
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const menuItems: { id: MenuSection; label: string; icon: typeof Package; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Productos', icon: Package, adminOnly: true },
  { id: 'users', label: 'Usuarios', icon: UserCog, adminOnly: true },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart },
  { id: 'reports', label: 'Reportes', icon: FileText, adminOnly: true },
  { id: 'audit', label: 'Auditoría', icon: Shield, adminOnly: true },
]

export function DashboardSidebar({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onToggleCollapse,
  mobileOpen,
  onMobileClose 
}: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const filteredItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  )

  const handleSectionChange = (section: MenuSection) => {
    onSectionChange(section)
    onMobileClose()
  }

  const sidebarContent = (
    <>
      <div className="p-3 sm:p-4 border-b border-sidebar-border flex items-center justify-between gap-2">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-sidebar-foreground truncate">CateringServices SIL&TE</h1>
              <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden flex-shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10 sm:h-11',
                activeSection === item.id && 'bg-sidebar-accent text-sidebar-primary',
                collapsed && 'justify-center px-2'
              )}
              onClick={() => handleSectionChange(item.id)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm sm:text-base">{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent h-10',
            collapsed && 'justify-center px-2'
          )}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && <span className="text-sm">{theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}</span>}
        </Button>

        {!collapsed && (
          <div className="px-2 py-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive h-10',
            collapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden text-foreground"
    >
      <Menu className="h-6 w-6" />
    </Button>
  )
}
