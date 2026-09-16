import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './QueryGuard.module.css';

type QueryGuardProps = {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  onRetry?: () => void;
};

export function QueryGuard({ isLoading, error, children, onRetry }: QueryGuardProps) {
  if (isLoading) return <p className={clsx(styles.root, styles.root_loading)}>Загрузка…</p>;
  if (error)
    return (
      <div className={clsx(styles.root, styles.root_error)}>
        <p>Ошибка: {error.message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Повторить
          </button>
        )}
      </div>
    );
  return <>{children}</>;
}
