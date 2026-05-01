'use client'

import { useNotification } from '@/lib/notification-context'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20'
      case 'error':
        return 'bg-destructive/10 border-destructive/20'
      case 'warning':
        return 'bg-warning/10 border-warning/20'
      case 'info':
      default:
        return 'bg-primary/10 border-primary/20'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor(
            notification.type,
          )} text-foreground pointer-events-auto animate-in slide-in-from-top-2 fade-in`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1">
            {notification.title && (
              <p className="font-medium text-sm">{notification.title}</p>
            )}
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
          {notification.dismissible && (
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
