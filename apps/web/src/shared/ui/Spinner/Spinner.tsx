import styles from './Spinner.module.css';

export function Spinner() {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>Загрузка…</span>
    </div>
  );
}
