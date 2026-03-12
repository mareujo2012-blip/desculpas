'use client'

import { useState, useTransition } from 'react'
import { updateUser, deleteUser } from '@/actions/admin'
import { useToast } from '@/components/Toast'
import styles from './AdminTable.module.css'

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  _count: { excuses: number };
}

interface EditModalProps {
  user: UserData;
  onClose: () => void;
  onSave: (id: string, name: string, email: string) => void;
  isPending: boolean;
}

function EditModal({ user, onClose, onSave, isPending }: EditModalProps) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)

  return (
    <div className={styles.overlay} onClick={!isPending ? onClose : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Editar Usuário</h3>
        <p className={styles.modalText}>Modifique os dados de <strong>{user.email}</strong></p>
        
        <div className={styles.formGroup}>
          <label>Nome</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className={styles.input} 
            disabled={isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={styles.input} 
            disabled={isPending}
          />
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={isPending}>Cancelar</button>
          <button 
            onClick={() => onSave(user.id, name, email)} 
            className={styles.saveBtn} 
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ email, onConfirm, onCancel, isPending }: { email: string; onConfirm: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div className={styles.overlay} onClick={!isPending ? onCancel : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIcon}>⚠️</div>
        <h3 className={styles.modalTitle}>Excluir Conta?</h3>
        <p className={styles.modalText}>
          Isso apagará permanentemente o usuário <strong>{email}</strong> e todas as desculpas geradas por ele.
        </p>
        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn} disabled={isPending}>Cancelar</button>
          <button onClick={onConfirm} className={styles.deleteConfirmBtn} disabled={isPending}>
            {isPending ? 'Excluindo...' : 'Tenho Certeza, Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTable({ initialUsers, currentUserId }: { initialUsers: UserData[], currentUserId: string }) {
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null)
  const [isPending, startTransition] = useTransition()
  const showToast = useToast()

  const handleSaveEdit = (id: string, name: string, email: string) => {
    startTransition(async () => {
      const result = await updateUser(id, { name, email })
      if (result.error) {
        showToast(result.error, 'error')
      } else {
        showToast('Usuário atualizado com sucesso.', 'success')
        setEditingUser(null)
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!deletingUser) return
    startTransition(async () => {
      const result = await deleteUser(deletingUser.id)
      if (result.error) {
        showToast(result.error, 'error')
      } else {
        showToast('Usuário excluído.', 'success')
        setDeletingUser(null)
      }
    })
  }

  return (
    <>
      {editingUser && (
        <EditModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleSaveEdit} 
          isPending={isPending} 
        />
      )}

      {deletingUser && (
        <ConfirmDeleteModal 
          email={deletingUser.email}
          onCancel={() => setDeletingUser(null)} 
          onConfirm={handleConfirmDelete} 
          isPending={isPending} 
        />
      )}

      <div className={`glass-panel ${styles.tableWrapper}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID do Usuário</th>
              <th>Nome / Login</th>
              <th>Status / Role</th>
              <th>Desculpas</th>
              <th className={styles.thActions}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u) => {
              const isAdmin = u.role === 'ADMIN'
              const isCurrentUser = u.id === currentUserId
              
              return (
                <tr key={u.id} className={styles.row}>
                  <td className={styles.tdId} title={u.id}>{u.id.slice(-8)}</td>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.userEmail}>{u.email}</span>
                      {u.name && <span className={styles.userName}>{u.name}</span>}
                      {isAdmin && <span className={styles.adminBadge}>Admin</span>}
                    </div>
                  </td>
                  <td className={styles.tdDate}>
                    Registrado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={styles.tdCount}>
                    {u._count.excuses} geradas
                  </td>
                  <td className={styles.tdActions}>
                    <button 
                      onClick={() => setEditingUser(u)} 
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                    >
                      ✏️ Editar
                    </button>
                    {!isCurrentUser && (
                      <button 
                        onClick={() => setDeletingUser(u)} 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
