'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store-context'
import type { Client, Sale } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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
} from '@/components/ui/dialog'
import {
  FileText,
  Printer,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  FileSpreadsheet,
  File,
  Search,
  ArrowRight,
  UserCircle,
  X,
} from 'lucide-react'

type ReportType = 'monthly' | 'dateRange' | 'clientDetail'

export function ReportsSection() {
  const { sales, clients } = useStore()
  const [reportType, setReportType] = useState<ReportType>('monthly')
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  )
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null)

  // Filtered clients for search (supports 300+ clients)
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients.slice(0, 20)
    const term = clientSearchTerm.toLowerCase()
    return clients.filter(
      (client) =>
        client.code.toLowerCase().includes(term) ||
        client.fullName.toLowerCase().includes(term) ||
        client.position.toLowerCase().includes(term)
    ).slice(0, 50)
  }, [clients, clientSearchTerm])

  // Filter sales by date range
  const filterSalesByDateRange = (salesList: Sale[], start: Date, end: Date) => {
    return salesList.filter((sale) => {
      const saleDate = new Date(sale.date)
      return saleDate >= start && saleDate <= end
    })
  }

  // Monthly consolidated report
  const monthlyReport = useMemo(() => {
    if (!selectedMonth) return []
    
    const [year, month] = selectedMonth.split('-').map(Number)
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)
    
    const filteredSales = filterSalesByDateRange(sales, startOfMonth, endOfMonth)
    
    const clientTotals: Record<string, { client: Client; total: number; salesCount: number }> = {}
    
    filteredSales.forEach((sale) => {
      const client = clients.find((c) => c.id === sale.clientId)
      if (client) {
        if (!clientTotals[client.id]) {
          clientTotals[client.id] = { client, total: 0, salesCount: 0 }
        }
        clientTotals[client.id].total += sale.total
        clientTotals[client.id].salesCount += 1
      }
    })
    
    return Object.values(clientTotals).sort((a, b) => b.total - a.total)
  }, [sales, clients, selectedMonth])

  // Date range report
  const dateRangeReport = useMemo(() => {
    if (!startDate || !endDate) return []
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59)
    
    const filteredSales = filterSalesByDateRange(sales, start, end)
    
    const clientTotals: Record<string, { client: Client; total: number; salesCount: number }> = {}
    
    filteredSales.forEach((sale) => {
      const client = clients.find((c) => c.id === sale.clientId)
      if (client) {
        if (!clientTotals[client.id]) {
          clientTotals[client.id] = { client, total: 0, salesCount: 0 }
        }
        clientTotals[client.id].total += sale.total
        clientTotals[client.id].salesCount += 1
      }
    })
    
    return Object.values(clientTotals).sort((a, b) => b.total - a.total)
  }, [sales, clients, startDate, endDate])

  // Client detail report
  const clientDetailReport = useMemo(() => {
    if (!selectedClientId) return []
    return sales
      .filter((sale) => sale.clientId === selectedClientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [sales, selectedClientId])

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  const getTotalFromReport = (report: typeof monthlyReport) => {
    return report.reduce((sum, item) => sum + item.total, 0)
  }

  const handleViewClientDetail = (client: Client) => {
    setSelectedClientForDetail(client)
    setDetailDialogOpen(true)
  }

  const handleSelectClientForReport = (client: Client) => {
    setSelectedClientId(client.id)
    setClientSearchTerm('')
  }

  const handleClearClientSelection = () => {
    setSelectedClientId('')
    setClientSearchTerm('')
  }

  const clientDetailSales = useMemo(() => {
    if (!selectedClientForDetail) return []
    return sales
      .filter((sale) => sale.clientId === selectedClientForDetail.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [sales, selectedClientForDetail])

  // Export functions
  const exportToPDF = (data: any[], title: string) => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f5e9; }
          .header { margin-bottom: 20px; }
          .date { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p class="date">Generado el: ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Cliente</th>
              <th>Area</th>
              <th>Total Ventas</th>
              <th>Total Consumo</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item: any) => `
              <tr>
                <td>${item.client.code}</td>
                <td>${item.client.fullName}</td>
                <td>${item.client.position}</td>
                <td>${item.salesCount}</td>
                <td>Bs. ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">TOTAL GENERAL</td>
              <td>${data.reduce((sum: number, item: any) => sum + item.salesCount, 0)}</td>
              <td>Bs. ${data.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const exportToExcel = (data: any[], title: string) => {
    const headers = ['Codigo', 'Cliente', 'Area', 'Total Ventas', 'Total Consumo (Bs.)']
    const rows = data.map((item: any) => [
      item.client.code,
      item.client.fullName,
      item.client.position,
      item.salesCount,
      item.total.toFixed(2)
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title.replace(/\s+/g, '_')}.csv`
    link.click()
  }

  const handlePrint = (data: any[], title: string) => {
    exportToPDF(data, title)
  }

  const currentReport = reportType === 'monthly' ? monthlyReport : dateRangeReport
  const currentTitle = reportType === 'monthly' 
    ? `Reporte Mensual - ${getMonthName(selectedMonth)}`
    : `Reporte ${startDate} a ${endDate}`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reportes</h2>
        <p className="text-muted-foreground">Genere planillas y reportes de consumo</p>
      </div>

      <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Mensual
          </TabsTrigger>
          <TabsTrigger value="dateRange" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            Por Fechas
          </TabsTrigger>
          <TabsTrigger value="clientDetail" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4 mr-2" />
            Por Cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Planilla Mensual Consolidada
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-48 bg-input border-border text-foreground"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyReport.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Clientes</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{monthlyReport.length}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Ventas</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {monthlyReport.reduce((sum, item) => sum + item.salesCount, 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="text-sm font-medium">Bs.</span>
                        <span className="text-sm">Total</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        Bs. {getTotalFromReport(monthlyReport).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Codigo</TableHead>
                        <TableHead className="text-muted-foreground">Cliente</TableHead>
                        <TableHead className="text-muted-foreground">Area</TableHead>
                        <TableHead className="text-muted-foreground text-center">Ventas</TableHead>
                        <TableHead className="text-muted-foreground text-right">Total</TableHead>
                        <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReport.map((item) => (
                        <TableRow key={item.client.id} className="border-border">
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">{item.client.code}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.client.fullName}</TableCell>
                          <TableCell className="text-muted-foreground">{item.client.position}</TableCell>
                          <TableCell className="text-center text-foreground">{item.salesCount}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            Bs. {item.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewClientDetail(item.client)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => exportToExcel(monthlyReport, currentTitle)} className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button variant="outline" onClick={() => exportToPDF(monthlyReport, currentTitle)} className="gap-2">
                      <File className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button onClick={() => handlePrint(monthlyReport, currentTitle)} className="gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay ventas registradas para este mes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dateRange" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Consumo por Rango de Fechas
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40 bg-input border-border text-foreground"
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40 bg-input border-border text-foreground"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {startDate && endDate ? (
                dateRangeReport.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Clientes</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{dateRangeReport.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">Ventas</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {dateRangeReport.reduce((sum, item) => sum + item.salesCount, 0)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 text-primary mb-1">
                          <span className="text-sm font-medium">Bs.</span>
                          <span className="text-sm">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          Bs. {getTotalFromReport(dateRangeReport).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">Codigo</TableHead>
                          <TableHead className="text-muted-foreground">Cliente</TableHead>
                          <TableHead className="text-muted-foreground">Area</TableHead>
                          <TableHead className="text-muted-foreground text-center">Ventas</TableHead>
                          <TableHead className="text-muted-foreground text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dateRangeReport.map((item) => (
                          <TableRow key={item.client.id} className="border-border">
                            <TableCell>
                              <Badge variant="secondary" className="font-mono">{item.client.code}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{item.client.fullName}</TableCell>
                            <TableCell className="text-muted-foreground">{item.client.position}</TableCell>
                            <TableCell className="text-center text-foreground">{item.salesCount}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              Bs. {item.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                      <Button variant="outline" onClick={() => exportToExcel(dateRangeReport, currentTitle)} className="gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                      </Button>
                      <Button variant="outline" onClick={() => exportToPDF(dateRangeReport, currentTitle)} className="gap-2">
                        <File className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button onClick={() => handlePrint(dateRangeReport, currentTitle)} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Imprimir
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay ventas en este rango de fechas</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Seleccione un rango de fechas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientDetail" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Consumo Detallado por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedClient ? (
                /* Client Search */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por codigo, nombre o area de trabajo..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="pl-10 bg-input border-border text-foreground h-12 text-base"
                      autoFocus
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {clientSearchTerm 
                      ? `Mostrando ${filteredClients.length} resultados` 
                      : `Mostrando primeros 20 de ${clients.length} clientes. Escriba para buscar.`}
                  </p>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleSelectClientForReport(client)}
                          className="w-full p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all text-left flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                              {client.code}
                            </Badge>
                            <div>
                              <p className="font-medium text-foreground">{client.fullName}</p>
                              <p className="text-sm text-muted-foreground">{client.position}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
                </div>
              ) : (
                /* Client Detail */
                <>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="text-sm text-muted-foreground">Codigo</p>
                          <p className="font-mono font-bold text-primary">{selectedClient.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre</p>
                          <p className="font-medium text-foreground">{selectedClient.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Area</p>
                          <p className="text-foreground">{selectedClient.position}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Consumido</p>
                          <p className="text-xl font-bold text-primary">
                            Bs. {clientDetailReport.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearClientSelection} className="gap-2 ml-4">
                        <X className="h-4 w-4" />
                        Cambiar
                      </Button>
                    </div>
                  </div>

                  {clientDetailReport.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">Fecha</TableHead>
                          <TableHead className="text-muted-foreground">Productos</TableHead>
                          <TableHead className="text-muted-foreground text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientDetailReport.map((sale) => (
                          <TableRow key={sale.id} className="border-border">
                            <TableCell className="text-foreground">
                              {new Date(sale.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="text-sm">
                                    <span className="text-foreground">{item.product.name}</span>
                                    <span className="text-muted-foreground"> x{item.quantity}</span>
                                    <span className="text-primary ml-2">
                                      Bs. {(item.product.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              Bs. {sale.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Este cliente no tiene ventas registradas</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Detalle de Consumo - {selectedClientForDetail?.fullName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Historial de consumo detallado del cliente seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedClientForDetail && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Codigo</p>
                    <p className="font-mono font-bold text-primary">{selectedClientForDetail.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="text-foreground">{selectedClientForDetail.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-primary">
                      Bs. {clientDetailSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {clientDetailSales.length > 0 ? (
                <div className="space-y-3">
                  {clientDetailSales.map((sale) => (
                    <div key={sale.id} className="p-3 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-bold text-primary">Bs. {sale.total.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-foreground">
                              {item.product.name} x{item.quantity}
                            </span>
                            <span className="text-muted-foreground">
                              Bs. {(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay ventas registradas</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
