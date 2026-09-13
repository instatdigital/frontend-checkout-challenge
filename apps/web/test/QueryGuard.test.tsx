import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryGuard } from '@/components/QueryGuard/QueryGuard';

afterEach(cleanup);

describe('QueryGuard', () => {
  it('shows loading state', () => {
    render(
      <QueryGuard isLoading={true} error={null}>
        <p>Content</p>
      </QueryGuard>,
    );
    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <QueryGuard isLoading={false} error={new Error('Network error')}>
        <p>Content</p>
      </QueryGuard>,
    );
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('renders children when loaded', () => {
    render(
      <QueryGuard isLoading={false} error={null}>
        <p>Content</p>
      </QueryGuard>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
