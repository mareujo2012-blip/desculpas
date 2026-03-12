'use client'

import { useActionState } from 'react'
import { generateExcuse } from '@/actions/generator'
import styles from './page.module.css'

export default function GeneratorForm() {
  const [state, action, isPending] = useActionState(generateExcuse, null)

  return (
    <div className={`glass-panel ${styles.formCard}`}>
      <h2>Nova Desculpa</h2>
      <p>Qual a situação da qual você está tentando escapar?</p>

      {state?.error && <div className={styles.errorAlert}>{state.error}</div>}

      <form action={action} className={styles.form}>
        <textarea 
          name="situation" 
          placeholder="Ex: não quero ir no rodízio de pizza porque estou sem dinheiro..."
          className={styles.textarea}
          rows={4}
          required
        ></textarea>
        
        <button type="submit" disabled={isPending} className={`btn-primary ${styles.submitBtn}`}>
          {isPending ? 'Elaborando uma mentira...' : 'Gerar Desculpa Infalível'}
        </button>
      </form>

      {state?.success && state.excuse && (
        <div className={styles.resultCard}>
          <h3>Sua desculpa está pronta:</h3>
          <p className={styles.generatedText}>{state.excuse.excuseText}</p>
        </div>
      )}
    </div>
  )
}
