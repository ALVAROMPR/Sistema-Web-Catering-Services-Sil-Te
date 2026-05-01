'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { useStore } from '@/lib/store-context'
import { useAuth } from '@/lib/auth-context'
import { useAudit } from '@/lib/audit-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, AlertCircle, CheckCircle2, FileUp } from 'lucide-react'

interface ImportRow {
  codigo?: string
  nombre?: string
  area?: string
  [key: string]: string | undefined
}

export function ImportClientsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [importData, setImportData] = useState<ImportRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addClient } = useStore()
  const { user } = useAuth()
  const { logAction } = useAudit()

  const validateRow = (row: ImportRow, index: number): string | null => {
    if (!row.codigo || !row.codigo.toString().trim()) {
      return `Fila ${index + 1}: Código es requerido`
    }
    if (!row.nombre || !row.nombre.toString().trim()) {
      return `Fila ${index + 1}: Nombre es requerido`
    }
    if (!row.area || !row.area.toString().trim()) {
      return `Fila ${index + 1}: Área es requerida`
    }
    return null
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErrors([])
    setImportData([])
    setSuccess(false)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newErrors: string[] = []
        const validRows: ImportRow[] = []

        if (results.data.length === 0) {
          setErrors(['El archivo está vacío'])
          return
        }

        (results.data as ImportRow[]).forEach((row, index) => {
          const error = validateRow(row, index)
          if (error) {
            newErrors.push(error)
          } else {
            validRows.push(row)
          }
        })

        if (newErrors.length > 0) {
          setErrors(newErrors)
        }
        setImportData(validRows)
      },
      error: (error) => {
        setErrors([`Error al procesar archivo: ${error.message}`])
      },
    })
  }

  const handleImport = () => {
    if (importData.length === 0) return
    if (!user) return

    setIsLoading(true)
    const importedClients = []
    const errorsDuringImport: string[] = []

    try {
      for (const row of importData) {
        try {
          addClient({
            code: row.codigo!.toString().trim(),
            fullName: row.nombre!.toString().trim(),
            area: row.area!.toString().trim(),
          })
          importedClients.push(row.codigo)
        } catch (error) {
          errorsDuringImport.push(
            `Error importando ${row.codigo}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          )
        }
      }

      logAction(
        'IMPORT_CLIENTS',
        user.id,
        user.name,
        user.role,
        {
          clientsImported: importedClients.length,
          clientCodes: importedClients,
        },
        'success',
      )

      setSuccess(true)
      setImportData([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (error) {
      logAction(
        'IMPORT_CLIENTS',
        user.id,
        user.name,
        user.role,
        { attemptedCount: importData.length },
        'error',
        error instanceof Error ? error.message : 'Error desconocido',
      )
      setErrors([
        ...errorsDuringImport,
        'Error durante la importación',
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          Importar Clientes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importar Clientes desde Excel
          </DialogTitle>
          <DialogDescription className="sr-only">
            Cargue un archivo CSV o Excel con los datos de clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Formato de archivo</CardTitle>
              <CardDescription className="text-xs">
                El archivo debe tener columnas: código, nombre, area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/50 p-3 rounded-lg text-xs text-muted-foreground space-y-1 font-mono">
                <p>código | nombre | area</p>
                <p>CLI001 | Juan Pérez | Ventas</p>
                <p>CLI002 | María García | Finanzas</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click para seleccionar archivo</p>
                <p className="text-xs text-muted-foreground mt-1">CSV o Excel</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs">
                      {err}
                    </p>
                  ))}
                  {errors.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      y {errors.length - 5} errores más
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {importData.length > 0 && (
            <Alert className="border-success/30 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                {importData.length} cliente{importData.length !== 1 ? 's' : ''} listo para importar
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-success/30 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Importación completada exitosamente
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={importData.length === 0 || isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
