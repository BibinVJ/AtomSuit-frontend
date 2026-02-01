import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 1 minute
      staleTime: 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // Don't refetch on window focus for development (optional, adjust as needed)
      refetchOnWindowFocus: false,
    },
  },
});
