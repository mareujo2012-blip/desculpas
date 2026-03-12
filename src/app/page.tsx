import styles from './page.module.css'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()

  // Redireciona usuários já logados direto para o gerador
  if (session) redirect('/gerador')

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Problemas para <span className={styles.highlight}>cancelar aquele compromisso?</span>
          </h1>
          <p className={styles.subtitle}>
            Nosso gerador cria desculpas infalíveis para qualquer situação.
            Não passe aperto, gere sua desculpa e viva em paz.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/registro" className={`btn-primary ${styles.heroBtn}`}>
              Começar Agora
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.iconWrapper}>💡</div>
          <h3>Criatividade Ilimitada</h3>
          <p>Desculpas sob medida que parecem 100% reais e convincentes.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.iconWrapper}>💾</div>
          <h3>Histórico Salvo</h3>
          <p>Crie uma conta e não perca as melhores desculpas já geradas.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <div className={styles.iconWrapper}>⚡</div>
          <h3>Rápido e Fácil</h3>
          <p>Em segundos você tem o texto perfeito para enviar no WhatsApp.</p>
        </div>
      </section>
    </div>
  )
}
