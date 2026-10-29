// Supabase calls for registrations. Two rules matter here:
//   1. membership_applications and event_registrations are INSERT-ONLY from the
//      public side. Never chain `.select()` onto those inserts — asking for the
//      row back needs a read policy, and that policy does not exist on purpose
//      (the rows hold email and phone numbers).
//   2. The open/closed window is decided by the database. The client only
//      displays what the database will allow.
import { supabase } from '../../lib/supabaseClient'

const WINDOW_COLUMNS = 'id, label, opens_at, closes_at, is_open, fields'
const FORM_COLUMNS = 'id, event_id, fields, opens_at, closes_at'

// ---------------------------------------------------------------------------
// Membership windows (public read; dates and question text only, never private)
// ---------------------------------------------------------------------------
export async function fetchWindows({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('membership_windows')
    .select(WINDOW_COLUMNS)
    .order('opens_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createWindow(values) {
  const { error } = await supabase.from('membership_windows').insert(values)
  if (error) throw error
}

export async function updateWindow({ id, values }) {
  const { error } = await supabase.from('membership_windows').update(values).eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Membership applications. Insert only; staff read.
// ---------------------------------------------------------------------------
export async function createApplication(values) {
  const { error } = await supabase.from('membership_applications').insert(values)
  if (error) throw error
}

export async function fetchApplications({ limit = 500 } = {}) {
  const { data, error } = await supabase
    .from('membership_applications')
    .select(
      'id, window_id, full_name, class, section, email, phone, reason, answers, consent, status, submitted_at, reviewed_by, reviewed_at, account_created_at',
    )
    .order('submitted_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function updateApplicationStatus({ id, status, reviewedBy }) {
  const { error } = await supabase
    .from('membership_applications')
    .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Stamped once the account exists, so the button is not offered twice. */
export async function markApplicationAccountCreated(id) {
  const { error } = await supabase
    .from('membership_applications')
    .update({ account_created_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Event registration forms
// ---------------------------------------------------------------------------
export async function fetchFormForEvent(eventId) {
  const { data, error } = await supabase
    .from('registration_forms')
    .select(FORM_COLUMNS)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) throw error
  return data
}

/** One query for the builder: each form with its event title and answer count. */
export async function fetchFormsForAdmin() {
  const { data, error } = await supabase
    .from('registration_forms')
    .select(`${FORM_COLUMNS}, events ( id, title, status ), event_registrations ( count )`)
    .order('opens_at', { ascending: false })

  if (error) throw error
  return data.map((form) => ({
    ...form,
    registrationCount: form.event_registrations?.[0]?.count ?? 0,
  }))
}

export async function createForm(values) {
  const { error } = await supabase.from('registration_forms').insert(values)
  if (error) throw error
}

export async function updateForm({ id, values }) {
  const { error } = await supabase.from('registration_forms').update(values).eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Event registrations. Insert only; staff read.
// ---------------------------------------------------------------------------
export async function createEventRegistration(values) {
  const { error } = await supabase.from('event_registrations').insert(values)
  if (error) throw error
}

export async function fetchEventRegistrations({ formId, limit = 1000 }) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id, form_id, full_name, email, answers, submitted_at')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}
