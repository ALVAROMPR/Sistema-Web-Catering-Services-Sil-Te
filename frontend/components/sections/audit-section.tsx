'use client'

import { useState } from 'react'
import { useAudit } from '@/lib/audit-context'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, Search, Filter } from 'lucide-react'

export function AuditSection() {
  const { auditLogs, getLoginAttempts } = useAudit()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('')

  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Auditoría</h2>
          <p className="text-muted-foreground">
            Solo administradores pueden acceder a esta sección
          </p>
        </div>
      </div>
    )
  }

  const filteredLogs = auditLogs.filter((log) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      log.userName.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search) ||
      JSON.stringify(log.details).toLowerCase().includes(search)

    const matchesAction = !filterAction || log.action === filterAction

    return matchesSearch && matchesAction
  })

  const actions = [...new Set(auditLogs.map((log) => log.action))]

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'bg-success/10 text-success'
    if (action.startsWith('UPDATE')) return 'bg-primary/10 text-primary'
    if (action.startsWith('DELETE')) return 'bg-destructive/10 text-destructive'
    if (action === 'LOGIN_SUCCESS') return 'bg-success/10 text-success'
    if (action === 'LOGIN_FAILED') return 'bg-destructive/10 text-destructive'
    return 'bg-secondary/10 text-foreground'
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE_PRODUCT: 'Crear Producto',
      UPDATE_PRODUCT: 'Actualizar Producto',
      DELETE_PRODUCT: 'Eliminar Producto',
      CREATE_CLIENT: 'Crear Cliente',
      UPDATE_CLIENT: 'Actualizar Cliente',
      DELETE_CLIENT: 'Eliminar Cliente',
      CREATE_USER: 'Crear Usuario',
      UPDATE_USER: 'Actualizar Usuario',
      DELETE_USER: 'Eliminar Usuario',
      CREATE_SALE: 'Crear Venta',
      IMPORT_CLIENTS: 'Importar Clientes',
      LOGIN_SUCCESS: 'Login Exitoso',
      LOGIN_FAILED: 'Login Fallido',
      LOGOUT: 'Logout',
    }
    return labels[action] || action
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Auditoría del Sistema</h2>
        <p className="text-muted-foreground">
          Registro de todas las operaciones realizadas en el sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-10 pr-3 py-2 rounded-lg border border-border bg-input text-foreground w-full"
          >
            <option value="">Todas las acciones</option>
            {actions.sort().map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Registro de Auditoría
          </CardTitle>
          <CardDescription>
            Total: {filteredLogs.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Fecha y Hora</TableHead>
                  <TableHead className="text-muted-foreground">Usuario</TableHead>
                  <TableHead className="text-muted-foreground">Acción</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-right">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="text-sm text-foreground">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground font-medium">
                        {log.userName}
                        <p className="text-xs text-muted-foreground">
                          {log.userRole === 'admin' ? 'Administrador' : 'Cajero'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionBadgeColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.status === 'success'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }
                        >
                          {log.status === 'success' ? 'Exitoso' : 'Error'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {Object.keys(log.details).length > 0 ? (
                          <div className="text-left">
                            {Object.entries(log.details)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <p key={key}>
                                  {key}: {JSON.stringify(value).substring(0, 30)}
                                  {JSON.stringify(value).length > 30 ? '...' : ''}
                                </p>
                              ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay registros de auditoría
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
