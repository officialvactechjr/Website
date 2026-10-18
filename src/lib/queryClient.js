import { QueryClient } from '@tanstack/react-query'

// `features/*/hooks.js` use this. Created once in lib/, never in a component.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
