import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuditProvider } from '@/lib/audit-context'
import { AuthProvider } from '@/lib/auth-context'
import { StoreProvider } from '@/lib/store-context'
import { ThemeProvider } from '@/lib/theme-context'
import { NotificationProvider } from '@/lib/notification-context'
import { NotificationContainer } from '@/components/notification-container'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SIL&TE - Sistema de Gestión de Consumo Alimenticio',
  description: 'Sistema web para mejorar la gestión de consumo alimenticio en la empresa Catering Services SIL&TE del departamento de Potosí Bolivia',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuditProvider>
          <AuthProvider>
            <StoreProvider>
              <ThemeProvider>
                <NotificationProvider>
                  {children}
                  <NotificationContainer />
                </NotificationProvider>
              </ThemeProvider>
            </StoreProvider>
          </AuthProvider>
        </AuditProvider>
        <Analytics />
      </body>
    </html>
  )
}
