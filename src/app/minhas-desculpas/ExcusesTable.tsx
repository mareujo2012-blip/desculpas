'use client'

import { useState, useTransition, useCallback } from 'react'
import { deleteExcuse } from '@/actions/generator'
import { useToast } from '@/components/Toast'
import styles from './ExcusesTable.module.css'

interface Excuse {
  id: string
  situation: string
  excuseText: string
  createdAt: Date
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIcon}>🗑️</div>
        <h3 className={styles.modalTitle}>Excluir Desculpa?</h3>
        <p className={styles.modalText}>Esta ação não pode ser desfeita.</p>
        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>Cancelar</button>
          <button onClick={onConfirm} className={styles.confirmBtn}>Sim, Excluir</button>
        </div>
      </div>
    </div>
  )
}

export default function ExcusesTable({ excuses }: { excuses: Excuse[] }) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const showToast = useToast()

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Desculpa copiada!', 'success'))
      .catch(() => showToast('Erro ao copiar.', 'error'))
  }, [showToast])

  const handleDelete = useCallback((id: string) => {
    const form = new FormData()
    form.append('excuseId', id)
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteExcuse(undefined, form)
      setDeletingId(null)
      if (result?.error) showToast(result.error, 'error')
      else showToast('Desculpa excluída com sucesso!', 'success')
    })
    setConfirmId(null)
  }, [showToast])

  return (
    <>
      {confirmId && (
        <ConfirmModal
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className={`glass-panel ${styles.tableWrapper}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thDate}>Data</th>
              <th className={styles.thSituation}>Situação</th>
              <th className={styles.thExcuse}>Desculpa Gerada</th>
              <th className={styles.thActions}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {excuses.map((exc) => (
              <tr
                key={exc.id}
                className={`${styles.row} ${deletingId === exc.id ? styles.deleting : ''}`}
              >
                <td className={styles.tdDate}>
                  {new Date(exc.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </td>
                <td className={styles.tdSituation}>
                  <span className={styles.situationBadge}>{exc.situation}</span>
                </td>
                <td className={styles.tdExcuse}>
                  <p className={styles.excuseText}>"{exc.excuseText}"</p>
                </td>
                <td className={styles.tdActions}>
                  <button
                    onClick={() => handleCopy(exc.excuseText)}
                    className={`${styles.actionBtn} ${styles.copyBtn}`}
                    title="Copiar desculpa"
                  >
                    <span>📋</span> Copiar
                  </button>
                  <button
                    onClick={() => setConfirmId(exc.id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Excluir desculpa"
                    disabled={deletingId === exc.id}
                  >
                    <span>🗑️</span> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
