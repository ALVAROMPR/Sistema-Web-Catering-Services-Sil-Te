'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store-context'
import { useAuth } from '@/lib/auth-context'
import { useNotification } from '@/lib/notification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react'

export function DashboardSection() {
  const { products, clients, sales } = useStore()
  const { user } = useAuth()
  const { addNotification } = useNotification()

  // Verificar stock bajo y mostrar alertas
  useEffect(() => {
    const lowStockProducts = products.filter((p) => p.stock < 5)
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach((product) => {
        addNotification({
          type: 'warning',
          title: 'Stock bajo',
          message: `${product.name}: ${product.stock} unidades`,
          duration: 0,
          dismissible: true,
        })
      })
    }
  }, [products, addNotification])

  const todaySales = sales.filter(
    (sale) => new Date(sale.date).toDateString() === new Date().toDateString()
  )
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

  const stats = [
    {
      title: 'Productos',
      value: products.length,
      icon: Package,
      description: 'Productos registrados',
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Clientes',
      value: clients.length,
      icon: Users,
      description: 'Clientes activos',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Ventas Hoy',
      value: todaySales.length,
      icon: ShoppingCart,
      description: `Bs. ${todayTotal.toFixed(2)} total`,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Ingresos Totales',
      value: `Bs. ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: `${sales.length} ventas totales`,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
  ]

  const recentSales = sales.slice(-5).reverse()

  return (
    <div className="space-y-6">
      <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Bienvenido, {user?.name || 'Usuario'}
          </h2>
          <p className="text-muted-foreground">
            Panel de control del sistema de punto de venta
          </p>
        </div>

        {products.some((p) => p.stock < 5) && (
          <Alert className="border-warning/30 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Tienes {products.filter((p) => p.stock < 5).length} producto(s) con stock bajo (menos de 5 unidades)
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{sale.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items.length} productos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">Bs. {sale.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay ventas registradas</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Accesos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors cursor-pointer">
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <p className="font-medium text-foreground">Nueva Venta</p>
                <p className="text-sm text-muted-foreground">Registrar venta</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors cursor-pointer">
                <Users className="h-8 w-8 text-chart-2 mb-2" />
                <p className="font-medium text-foreground">Clientes</p>
                <p className="text-sm text-muted-foreground">Ver listado</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors cursor-pointer">
                <Package className="h-8 w-8 text-chart-3 mb-2" />
                <p className="font-medium text-foreground">Productos</p>
                <p className="text-sm text-muted-foreground">Gestionar</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors cursor-pointer">
                <TrendingUp className="h-8 w-8 text-chart-4 mb-2" />
                <p className="font-medium text-foreground">Reportes</p>
                <p className="text-sm text-muted-foreground">Ver estadísticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
