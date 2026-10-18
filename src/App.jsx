import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/shared/ErrorBoundary'
import IntroAnimation from './components/shared/IntroAnimation'
import AppRouter from './routes'
import { queryClient } from './lib/queryClient'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <IntroAnimation />
          <AppRouter />
          <Toaster position="top-right" theme="system" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
