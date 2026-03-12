import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ToastProvider } from '@/components/Toast'
import { logout } from '@/actions/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Gerador de Desculpas | Saia de qualquer furada',
  description: 'Gere desculpas criativas e salve seu histórico com facilidade.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  let user = null
  if (session) {
    user = await prisma.user.findUnique({ where: { id: session.userId } })
  }

  const displayName = user?.name 
    ? user.name.split(' ')[0] 
    : user?.email.split('@')[0] || 'usuário'

  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <header className="main-header glass-panel">
            <div className="header-content">
              <Link href="/" className="logo">
                Gerador de <span>Desculpas</span>
              </Link>
              <nav className="header-nav" style={{ alignItems: 'center' }}>
                {session ? (
                  <>
                    {user?.role === 'ADMIN' && (
                      <Link href="/admin" className="nav-link" style={{ color: 'var(--color-primary)' }}>Dashboard Admin</Link>
                    )}
                    <Link href="/gerador" className="nav-link">Gerar Desculpa</Link>
                    <Link href="/minhas-desculpas" className="nav-link">Minhas Desculpas</Link>
                    <span className="welcome-text">Olá, <strong>{displayName}</strong></span>
                    <form action={logout} style={{ display: 'inline', margin: 0 }}>
                      <button className="logout-btn">
                        Sair
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="nav-link">Entrar</Link>
                    <Link href="/registro" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      Criar Conta
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main className="app-main">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
