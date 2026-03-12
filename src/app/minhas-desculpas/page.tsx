import { getExcuseHistory } from '@/actions/generator'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import ExcusesTable from './ExcusesTable'
import styles from './page.module.css'

export const metadata = {
  title: 'Minhas Desculpas | Gerador de Desculpas',
  description: 'Gerencie todas as suas desculpas salvas.',
}

export default async function MinhasDesculpasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const excuses = await getExcuseHistory()

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Minhas Desculpas</h1>
          <p className={styles.subtitle}>
            {excuses.length === 0
              ? 'Você ainda não gerou nenhuma desculpa.'
              : `${excuses.length} desculpa${excuses.length > 1 ? 's' : ''} salva${excuses.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {excuses.length === 0 ? (
        <div className={`glass-panel ${styles.emptyState}`}>
          <span className={styles.emptyIcon}>🤷</span>
          <h2>Nenhuma desculpa por aqui!</h2>
          <p>Vá para o Gerador e crie sua primeira desculpa infalível.</p>
          <a href="/gerador" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'inline-block', marginTop: '0.5rem' }}>
            Ir para o Gerador
          </a>
        </div>
      ) : (
        <ExcusesTable excuses={excuses} />
      )}
    </div>
  )
}
