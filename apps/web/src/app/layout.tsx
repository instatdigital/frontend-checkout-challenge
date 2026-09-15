import { Outlet } from 'react-router';
import styles from './layout.module.css';

export function Layout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.logo}>Магазин</span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
