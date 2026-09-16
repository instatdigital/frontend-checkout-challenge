import { Link, Outlet } from 'react-router';
import styles from './layout.module.css';

export function Layout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Магазин
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>
            Каталог
          </Link>
          <Link to="/cart" className={styles.link}>
            Корзина
          </Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
