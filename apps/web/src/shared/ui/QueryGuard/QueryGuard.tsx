import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './QueryGuard.module.css';

type QueryGuardProps = {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
};

export function QueryGuard({ isLoading, error, children }: QueryGuardProps) {
  if (isLoading) return <p className={clsx(styles.root, styles.root_loading)}>Загрузка…</p>;
  if (error) return <p className={clsx(styles.root, styles.root_error)}>Ошибка: {error.message}</p>;
  return <>{children}</>;
}
