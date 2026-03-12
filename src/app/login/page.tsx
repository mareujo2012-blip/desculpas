'use client'

import styles from '../registro/page.module.css'
import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null)

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formCard}`}>
        <h1 className={styles.title}>Bem-vindo de volta</h1>
        <p className={styles.subtitle}>Faça login para continuar gerenciando suas desculpas.</p>
        
        {state?.error && <div className={styles.errorAlert}>{state.error}</div>}

        <form className={styles.form} action={action}>
          <div className={styles.inputGroup}>
            <label htmlFor="identifier">E-mail ou Login</label>
            <input type="text" id="identifier" name="identifier" required className={styles.input} placeholder="seu e-mail ou nome de usuário" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" name="password" required className={styles.input} placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={isPending} className={`btn-primary ${styles.submitBtn}`}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <p className={styles.footerText}>
          Novo por aqui? <Link href="/registro" className={styles.link}>Crie uma Conta</Link>
        </p>
      </div>
    </div>
  )
}
