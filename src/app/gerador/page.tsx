import styles from './page.module.css'
import { getExcuseHistory } from '@/actions/generator'
import GeneratorForm from './GeneratorForm'
import HistoryList from './HistoryList'

export default async function GeradorPage() {
  const history = await getExcuseHistory()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel de Controle</h1>
          <p className={styles.subtitle}>Crie suas desculpas ou veja seu histórico</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <section className={styles.generatorSection}>
          <GeneratorForm />
        </section>

        <section className={styles.historySection}>
          <h2>Seu Histórico</h2>
          <HistoryList excuses={history} />
        </section>
      </div>
    </div>
  )
}
