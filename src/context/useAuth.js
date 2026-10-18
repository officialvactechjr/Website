import { createContext, useContext } from 'react'

// The context object and its hook live here, not in AuthContext.jsx: a file that
// exports a component must export only components for fast refresh to work.
export const AuthContext = createContext(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
