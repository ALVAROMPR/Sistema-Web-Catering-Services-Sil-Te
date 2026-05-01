'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store-context'
import { useAuth } from '@/lib/auth-context'
import { useAudit } from '@/lib/audit-context'
import type { Product, Client, SaleItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  Wine,
  Cigarette,
  Receipt,
  UserCircle,
  ArrowRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryConfig = {
  snacks: { label: 'Snacks', icon: Cookie, color: 'bg-chart-3/20 text-chart-3' },
  refrescos: { label: 'Refrescos', icon: Wine, color: 'bg-chart-2/20 text-chart-2' },
  cigarros: { label: 'Cigarros', icon: Cigarette, color: 'bg-chart-4/20 text-chart-4' },
  desayuno: { label: 'Desayuno', icon: Coffee, color: 'bg-chart-1/20 text-chart-1' },
  almuerzo: { label: 'Almuerzo', icon: UtensilsCrossed, color: 'bg-primary/20 text-primary' },
  cena: { label: 'Cena', icon: Moon, color: 'bg-chart-5/20 text-chart-5' },
}

export function SalesSection() {
  const { products, clients, addSale } = useStore()
  const { user } = useAuth()
  const { logAction } = useAudit()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState<SaleItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [saleComplete, setSaleComplete] = useState(false)

  // Filtered clients for search (supports 300+ clients)
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients.slice(0, 20) // Show first 20 by default
    const term = clientSearchTerm.toLowerCase()
    return clients.filter(
      (client) =>
        client.code.toLowerCase().includes(term) ||
        client.fullName.toLowerCase().includes(term) ||
        client.position.toLowerCase().includes(term)
    ).slice(0, 50) // Limit results for performance
  }, [clients, clientSearchTerm])

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    products.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = []
      }
      grouped[product.category].push(product)
    })
    return grouped
  }, [products])

  const displayedProducts = activeCategory
    ? productsByCategory[activeCategory] || []
    : products

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const completeSale = () => {
    if (!selectedClient || cartItems.length === 0 || !user) return

    addSale({
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      items: cartItems,
      total: cartTotal,
      date: new Date(),
      registeredBy: user.name,
      registeredByRole: user.role,
    })

    logAction(
      'CREATE_SALE',
      user.id,
      user.name,
      user.role,
      {
        clientId: selectedClient.id,
        clientName: selectedClient.fullName,
        itemsCount: cartItems.length,
        total: cartTotal,
      },
    )

    setSaleComplete(true)
    setTimeout(() => {
      setCartItems([])
      setSelectedClient(null)
      setClientSearchTerm('')
      setSaleComplete(false)
    }, 2000)
  }

  const startNewSale = () => {
    setCartItems([])
    setSelectedClient(null)
    setClientSearchTerm('')
    setSaleComplete(false)
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    setClientSearchTerm('')
  }

  const handleChangeClient = () => {
    setSelectedClient(null)
    setClientSearchTerm('')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Nueva Venta</h2>
          <p className="text-sm text-muted-foreground">
            Registrando como: <span className="font-medium text-primary">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <Button variant="outline" onClick={startNewSale} className="gap-2 w-full sm:w-auto">
          <Receipt className="h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {saleComplete ? (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Venta Completada</h3>
            <p className="text-muted-foreground">La venta ha sido registrada exitosamente</p>
            <p className="text-sm text-muted-foreground mt-2">Registrada por: {user?.name} ({user?.role})</p>
          </CardContent>
        </Card>
      ) : !selectedClient ? (
        /* Step 1: Client Selection */
        <Card className="border-border">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <UserCircle className="h-5 w-5 text-primary" />
              Paso 1: Buscar y Seleccionar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por codigo, nombre o area de trabajo..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground h-11 sm:h-12 text-sm sm:text-base"
                autoFocus
              />
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              {clientSearchTerm 
                ? `Mostrando ${filteredClients.length} resultados` 
                : `Mostrando primeros 20 de ${clients.length} clientes. Escriba para buscar.`}
            </p>

            <ScrollArea className="h-[350px] sm:h-[400px]">
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Badge variant="secondary" className="font-mono text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
                        {client.code}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">{client.fullName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{client.position}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron clientes</p>
                    <p className="text-sm">Intente con otro termino de busqueda</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        /* Step 2: Product Selection */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Client Info */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-3 sm:py-4 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Cliente seleccionado</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">{selectedClient.code}</Badge>
                        <span className="font-medium text-foreground text-sm sm:text-base">{selectedClient.fullName}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleChangeClient} className="gap-2 self-end sm:self-auto">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cambiar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Filters */}
            <Card className="border-border">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-foreground text-sm sm:text-base">Paso 2: Seleccionar Productos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(null)}
                    className="text-xs sm:text-sm"
                  >
                    Todos
                  </Button>
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <Button
                        key={key}
                        variant={activeCategory === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(key)}
                        className="gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{config.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <Card className="border-border">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-foreground text-sm sm:text-base">
                  Productos {activeCategory && `- ${categoryConfig[activeCategory as keyof typeof categoryConfig]?.label}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {displayedProducts.map((product) => {
                    const config = categoryConfig[product.category]
                    const Icon = config.icon
                    const inCart = cartItems.find((item) => item.product.id === product.id)
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className={cn(
                          'p-2 sm:p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors text-left relative',
                          inCart && 'ring-2 ring-primary'
                        )}
                      >
                        {inCart && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs flex items-center justify-center font-bold">
                            {inCart.quantity}
                          </span>
                        )}
                        <div className={cn('w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center mb-2', config.color)}>
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <p className="font-medium text-foreground text-xs sm:text-sm truncate">{product.name}</p>
                        <p className="text-primary font-bold text-xs sm:text-sm">Bs. {product.price.toFixed(2)}</p>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="border-border lg:sticky lg:top-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-foreground flex items-center gap-2 text-base">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrito ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                {cartItems.length > 0 ? (
                  <>
                    <ScrollArea className="h-[200px] sm:h-[300px] pr-4">
                      <div className="space-y-2 sm:space-y-3">
                        {cartItems.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {item.product.name}
                              </p>
                              <p className="text-primary text-xs sm:text-sm">
                                Bs. {item.product.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-7 sm:w-7"
                                onClick={() => updateQuantity(item.product.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 sm:w-6 text-center text-foreground font-medium text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-7 sm:w-7"
                                onClick={() => updateQuantity(item.product.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-7 sm:w-7 text-destructive"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">Bs. {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-base sm:text-lg">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-bold text-primary">Bs. {cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={completeSale}
                      >
                        Completar Venta
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">El carrito esta vacio</p>
                    <p className="text-xs">Seleccione productos para agregar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
