'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { useAudit } from '@/lib/audit-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Lock, User, AlertCircle, Sun, Moon, Utensils } from 'lucide-react'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState<number | null>(null)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { recordLoginAttempt, getLoginAttempts } = useAudit()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Verificar si la cuenta está bloqueada
    if (isLocked && lockTime) {
      const timeRemaining = Math.ceil((lockTime - Date.now()) / 1000)
      if (timeRemaining > 0) {
        setError(`Cuenta bloqueada. Intente en ${timeRemaining} segundos`)
        return
      }
      setIsLocked(false)
      setLockTime(null)
    }
    
    if (!username || !password) {
      setError('Por favor complete todos los campos')
      return
    }
    
    const success = login(username, password)
    recordLoginAttempt(username, success)
    
    if (!success) {
      const attempts = getLoginAttempts(username)
      const recentFailures = attempts.filter((a) => {
        const timeDiff = Date.now() - new Date(a.timestamp).getTime()
        return !a.success && timeDiff < 15 * 60 * 1000 // Últimos 15 minutos
      }).length
      
      if (recentFailures >= 5) {
        setIsLocked(true)
        const lockDuration = 15 * 60 * 1000 // 15 minutos
        const newLockTime = Date.now() + lockDuration
        setLockTime(newLockTime)
        setError('Cuenta bloqueada por 15 minutos por múltiples intentos fallidos')
      } else {
        const remainingAttempts = 5 - recentFailures
        setError(`Credenciales inválidas. ${remainingAttempts} intentos restantes`)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 text-foreground hover:bg-secondary"
        aria-label="Cambiar tema"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Utensils className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground text-balance leading-tight">
              Catering Services SIL&TE
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground text-balance">
              Sistema de Gestión de Consumo Alimenticio
            </p>
            <p className="text-xs text-muted-foreground/70">
              Potosí, Bolivia
            </p>
          </div>
          <CardDescription className="text-muted-foreground pt-2">
            Ingrese sus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-foreground">Usuario</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-11"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel className="text-foreground">Contraseña</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-11"
                  />
                </div>
              </Field>
            </FieldGroup>
            
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full h-11 text-base">
              Iniciar Sesión
            </Button>
            
            <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4 p-3 bg-secondary/50 rounded-lg">
              <p className="font-medium mb-1">Credenciales de prueba:</p>
              <p>Admin: admin / admin123</p>
              <p>Cajero: cajero / cajero123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
