import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchOwnProfile, signOut } from '../features/auth/api'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Keep the session in sync with Supabase: login, logout and token refresh.
  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
        if (!data.session) setLoading(false)
      })
      .catch(() => {
        // Offline, or a bad project URL. Stop waiting so the UI can say so
        // instead of spinning forever.
        if (active) setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Load the profile whenever the session changes. A deactivated account is
  // signed straight back out, even if it still held a valid session.
  useEffect(() => {
    if (!session) return undefined
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const next = await fetchOwnProfile()
        if (!active) return

        if (next && next.is_active === false) {
          await signOut()
          if (active) setProfile(null)
          return
        }
        setProfile(next)
      } catch (error) {
        if (import.meta.env.DEV) console.error(error)
        if (active) setProfile(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  async function refreshProfile() {
    try {
      setProfile(await fetchOwnProfile())
    } catch (error) {
      // Keep the profile we already have. A failed refresh must not look like a
      // failed save to whoever called us.
      if (import.meta.env.DEV) console.error(error)
    }
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, role: profile?.role ?? null, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
