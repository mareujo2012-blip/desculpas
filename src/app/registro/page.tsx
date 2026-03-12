'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { useActionState, useState, useCallback } from 'react'
import { register } from '@/actions/auth'

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Muito fraca', color: '#E83F5B' }
  if (score === 2) return { score, label: 'Fraca', color: '#F2935C' }
  if (score === 3) return { score, label: 'Média', color: '#F2D407' }
  if (score === 4) return { score, label: 'Forte', color: '#04D361' }
  return { score, label: 'Muito forte', color: '#04D361' }
}

export default function RegistroPage() {
  const [state, action, isPending] = useActionState(register, null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [clientError, setClientError] = useState('')

  const strength = getPasswordStrength(password)

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  const passwordsMatch = password === confirmPassword
  const isStrongEnough = strength.score >= 3

  const handleSubmit = useCallback((formData: FormData) => {
    setClientError('')
    if (!isEmailValid(email)) {
      setClientError('Por favor, insira um e-mail válido.')
      return
    }
    if (!isStrongEnough) {
      setClientError('A senha precisa ser pelo menos de força "Média". Adicione letras maiúsculas, números ou símbolos.')
      return
    }
    if (!passwordsMatch) {
      setClientError('As senhas não coincidem.')
      return
    }
    action(formData)
  }, [email, isStrongEnough, passwordsMatch, action])

  const displayError = clientError || state?.error

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formCard}`}>
        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.subtitle}>Comece a criar e salvar suas desculpas infalíveis.</p>

        {displayError && <div className={styles.errorAlert}>{displayError}</div>}

        <form className={styles.form} action={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nome (opcional)</label>
            <input type="text" id="name" name="name" className={styles.input} placeholder="Seu nome" />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={`${styles.input} ${email && (isEmailValid(email) ? styles.inputValid : styles.inputError)}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email && !isEmailValid(email) && (
              <span className={styles.fieldError}>E-mail inválido</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthBar}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={styles.strengthSegment}
                      style={{ backgroundColor: i <= strength.score ? strength.color : 'var(--color-border)' }}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            {password && (
              <ul className={styles.passwordHints}>
                <li className={password.length >= 8 ? styles.hintOk : styles.hintMissing}>
                  {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(password) ? styles.hintOk : styles.hintMissing}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Uma letra maiúscula
                </li>
                <li className={/[0-9]/.test(password) ? styles.hintOk : styles.hintMissing}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Um número
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? styles.hintOk : styles.hintMissing}>
                  {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Um símbolo (!@#$%...)
                </li>
              </ul>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className={`${styles.input} ${confirmPassword && (passwordsMatch ? styles.inputValid : styles.inputError)}`}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && !passwordsMatch && (
              <span className={styles.fieldError}>As senhas não coincidem</span>
            )}
            {confirmPassword && passwordsMatch && (
              <span className={styles.fieldSuccess}>✓ Senhas coincidem</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`btn-primary ${styles.submitBtn}`}
          >
            {isPending ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p className={styles.footerText}>
          Já tem uma conta? <Link href="/login" className={styles.link}>Fazer Login</Link>
        </p>
      </div>
    </div>
  )
}
