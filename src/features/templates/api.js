// Saved question lists (form_templates). Staff read and write; only Admin and
// Super Admin delete. Visitors and members never reach this table.
import { supabase } from '../../lib/supabaseClient'

const COLUMNS =
  'id, kind, name, description, fields, created_by, created_at, updated_at, is_archived'

export async function fetchTemplates({ kind } = {}) {
  let query = supabase.from('form_templates').select(COLUMNS).order('name')
  if (kind) query = query.eq('kind', kind)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createTemplate(values) {
  const { error } = await supabase.from('form_templates').insert(values)
  if (error) throw error
}

export async function updateTemplate({ id, values }) {
  const { error } = await supabase
    .from('form_templates')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** A template is never overwritten; a copy is a new row. */
export async function duplicateTemplate(template) {
  const { error } = await supabase.from('form_templates').insert({
    kind: template.kind,
    name: `${template.name} (copy)`,
    description: template.description,
    fields: template.fields,
  })
  if (error) throw error
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('form_templates').delete().eq('id', id)
  if (error) throw error
}
