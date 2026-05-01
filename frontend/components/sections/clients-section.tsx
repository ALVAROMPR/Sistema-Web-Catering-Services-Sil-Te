'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store-context'
import { useAuth } from '@/lib/auth-context'
import { useAudit } from '@/lib/audit-context'
import type { Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ImportClientsDialog } from '@/components/import-clients-dialog'
import { Plus, Pencil, Trash2, Users, Search, BadgeIcon, Clock, User } from 'lucide-react'

export function ClientsSection() {
  const { clients, addClient, updateClient, deleteClient } = useStore()
  const { user } = useAuth()
  const { logAction } = useAudit()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    position: '',
  })

  const isAdmin = user?.role === 'admin'

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase()
    return (
      client.code.toLowerCase().includes(search) ||
      client.fullName.toLowerCase().includes(search) ||
      client.position.toLowerCase().includes(search)
    )
  })

  const resetForm = () => {
    setFormData({ code: '', fullName: '', position: '' })
    setEditingClient(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    if (editingClient) {
      updateClient(editingClient.id, formData, { userName: user.name, userRole: user.role })
      logAction(
        'UPDATE_CLIENT',
        user.id,
        user.name,
        user.role,
        { clientId: editingClient.id, data: formData },
      )
    } else {
      addClient(formData, { userName: user.name, userRole: user.role })
      logAction(
        'CREATE_CLIENT',
        user.id,
        user.name,
        user.role,
        formData,
      )
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (client: Client) => {
    if (!isAdmin) return
    setEditingClient(client)
    setFormData({
      code: client.code,
      fullName: client.fullName,
      position: client.position,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!isAdmin) return
    if (confirm('Esta seguro de eliminar este cliente?')) {
      deleteClient(id)
      logAction(
        'DELETE_CLIENT',
        user?.id || '',
        user?.name || '',
        user?.role || 'cajero',
        { clientId: id },
      )
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Gestione los clientes de la empresa' : 'Visualice y agregue clientes'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {isAdmin && <ImportClientsDialog />}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open || !editingClient || isAdmin) {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}>
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Formulario para gestionar los datos del cliente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-foreground">Codigo de Empleado</FieldLabel>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="EMP001"
                    required
                    className="bg-input border-border text-foreground uppercase"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-foreground">Nombre Completo</FieldLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Juan Perez Garcia"
                    required
                    className="bg-input border-border text-foreground"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-foreground">Cargo / Area de Trabajo</FieldLabel>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contabilidad"
                    required
                    className="bg-input border-border text-foreground"
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClient ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 text-primary" />
              Clientes Registrados ({filteredClients.length})
            </CardTitle>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {filteredClients.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Codigo</TableHead>
                    <TableHead className="text-muted-foreground">Nombre Completo</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Cargo / Area</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Registrado por</TableHead>
                    {isAdmin && <TableHead className="text-muted-foreground text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border">
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary font-mono text-xs sm:text-sm">
                          <BadgeIcon className="h-3 w-3" />
                          {client.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm sm:text-base">{client.fullName}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{client.position}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{client.position}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.audit && (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{client.audit.createdBy}</span>
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                {client.audit.createdByRole}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(client.audit.createdAt)}</span>
                            </div>
                            {client.audit.updatedBy && (
                              <div className="flex items-center gap-1 text-chart-3 text-[10px]">
                                <span>Modificado: {client.audit.updatedBy} ({formatDate(client.audit.updatedAt)})</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(client)}
                              className="text-muted-foreground hover:text-foreground h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(client.id)}
                              className="text-destructive hover:text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron clientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
