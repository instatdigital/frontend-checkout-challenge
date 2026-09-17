import { QueryClient, QueryClientProvider, type QueryClientConfig } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';

type WrapperOptions = {
  withRouter?: boolean;
  queryClientOptions?: QueryClientConfig;
};

export function createTestWrapper(options: WrapperOptions = {}) {
  const { withRouter, queryClientOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
      ...queryClientOptions,
    });

    const inner = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    return withRouter ? <MemoryRouter>{inner}</MemoryRouter> : inner;
  };

  return Wrapper;
}
