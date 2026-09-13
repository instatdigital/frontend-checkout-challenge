import type { ReactNode } from 'react';
import './QueryGuard.module.css';

type QueryGuardProps = {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
};

export function QueryGuard({ isLoading, error, children }: QueryGuardProps) {
  if (isLoading) return <p className="query-guard query-guard--loading">Загрузка…</p>;
  if (error) return <p className="query-guard query-guard--error">Ошибка: {error.message}</p>;
  return <>{children}</>;
}
