import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchOwnProfile, signOut } from '../features/auth/api'
import { STAFF_ROLES, STAFF_SESSION_KEY, VIEW_SITE_KEY, writeFlag } from '../lib/constants'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // The user id the profile has already been loaded for.
  //
  // Supabase fires an auth event on every token refresh, and it refreshes the
  // token when the tab regains focus. Those events carry a *new session object*
  // for the *same person*; treating one as a new session used to flip `loading`
  // back on, which unmounted the page, blanked the form and re-showed the
  // full-page spinner. Nothing about the person has changed, so nothing loads.
  const loadedFor = useRef(null)

  // Keep the session in sync with Supabase: login, logout and token refresh.
  useEffect(() => {
    let active = true
    let lastUser = null

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        if (data.session?.user?.id) lastUser = data.session.user.id
        setSession(data.session)
        if (!data.session) setLoading(false)
      })
      .catch(() => {
        // Offline, or a bad project URL. Stop waiting so the UI can say so
        // instead of spinning forever.
        if (active) setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      const userId = next?.user?.id ?? null

      // Same person: a refresh, or the tab coming back into focus. The token is
      // already updated inside the Supabase client, so the UI needs nothing.
      if (userId && userId === lastUser) return
      lastUser = userId

      setSession(next)

      if (!next) {
        setProfile(null)
        loadedFor.current = null
        setLoading(false)
        // Signed out: no stale staff or "view website" flag.
        writeFlag(STAFF_SESSION_KEY, false, 'local')
        writeFlag(VIEW_SITE_KEY, false)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Load the profile whenever the *person* changes. A deactivated account is
  // signed straight back out, even if it still held a valid session.
  useEffect(() => {
    const userId = session?.user?.id ?? null
    if (!userId || loadedFor.current === userId) return undefined

    loadedFor.current = userId
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
        // Remember staff for the pre-paint `/` redirect; a member clears it. Stored
        // persistently so a fresh tab is redirected before anything paints.
        writeFlag(STAFF_SESSION_KEY, STAFF_ROLES.includes(next?.role), 'local')
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
