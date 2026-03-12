'use client'

import { useState, useTransition, useCallback } from 'react'
import { deleteExcuse } from '@/actions/generator'
import { useToast } from '@/components/Toast'
import styles from './HistoryList.module.css'

interface Excuse {
  id: string
  situation: string
  excuseText: string
  createdAt: Date
}

interface HistoryListProps {
  excuses: Excuse[]
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Excluir Desculpa?</h3>
        <p className={styles.modalText}>Esta ação não pode ser desfeita. Tem certeza?</p>
        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>Cancelar</button>
          <button onClick={onConfirm} className={styles.confirmBtn}>Sim, Excluir</button>
        </div>
      </div>
    </div>
  )
}

function ExcuseCard({ excuse }: { excuse: Excuse }) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const showToast = useToast()

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(excuse.excuseText)
      .then(() => showToast('Desculpa copiada!', 'success'))
      .catch(() => showToast('Erro ao copiar.', 'error'))
  }, [excuse.excuseText, showToast])

  const handleDelete = useCallback(() => {
    const form = new FormData()
    form.append('excuseId', excuse.id)
    startTransition(async () => {
      const result = await deleteExcuse(undefined, form)
      if (result?.error) showToast(result.error, 'error')
      else showToast('Desculpa excluída!', 'success')
    })
    setConfirmId(null)
  }, [excuse.id, showToast])

  return (
    <>
      {confirmId === excuse.id && (
        <ConfirmModal onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      )}
      <div className={`glass-panel ${styles.card} ${isPending ? styles.deleting : ''}`}>
        <div className={styles.cardHeader}>
          <span className={styles.date}>
            {new Date(excuse.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <div className={styles.actions}>
            <button onClick={handleCopy} className={styles.actionBtn} title="Copiar desculpa">
              📋
            </button>
            <button
              onClick={() => setConfirmId(excuse.id)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              title="Excluir desculpa"
              disabled={isPending}
            >
              🗑️
            </button>
          </div>
        </div>
        <h4 className={styles.situation}>Situação: {excuse.situation}</h4>
        <p className={styles.excuseText}>"{excuse.excuseText}"</p>
      </div>
    </>
  )
}

export default function HistoryList({ excuses }: HistoryListProps) {
  if (excuses.length === 0) {
    return <p className={styles.emptyText}>Você ainda não inventou nenhuma desculpa.</p>
  }

  return (
    <div className={styles.list}>
      {excuses.map((exc) => (
        <ExcuseCard key={exc.id} excuse={exc} />
      ))}
    </div>
  )
}
