import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.container}>
      <Link href="/">
        <a href="">
          <div className={styles.content}>
            <img src="/images/logo.svg" alt="logo" />
          </div>
        </a>
      </Link>
    </header>
  )
}
