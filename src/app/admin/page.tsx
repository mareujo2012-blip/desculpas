import { getUsers } from '@/actions/admin'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminTable from './AdminTable'
import styles from './page.module.css'

export const metadata = {
  title: 'Administração | Gerador de Desculpas',
  description: 'Área restrita de gestão de usuários.',
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'ADMIN') redirect('/gerador')

  const usersList = await getUsers()

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Painel Administrativo</h1>
          <p className={styles.subtitle}>Gerencie os usuários cadastrados no sistema.</p>
        </div>
      </div>

      <AdminTable initialUsers={usersList} currentUserId={user.id} />
    </div>
  )
}
