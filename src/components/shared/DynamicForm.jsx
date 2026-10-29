import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

/**
 * Turns the stored question list into a Zod schema, so a form built in the admin
 * panel is validated exactly like a hand-written one. Types: text, textarea,
 * email, tel, url, select (radio/dropdown), multiselect (checkboxes) and consent.
 */
function buildSchema(fields) {
  const shape = {
    // Honeypot: hidden from people, irresistible to bots. `onSubmit` decides.
    website: z.string().optional(),
  }

  for (const field of fields) {
    const options = Array.isArray(field.options) && field.options.length > 0 ? field.options : []
    let rule

    if (field.type === 'consent') {
      rule = z.boolean().refine((value) => value === true, 'Please tick the box to continue')
      shape[field.id] = field.required ? rule : z.boolean().optional()
      continue
    }

    if (field.type === 'multiselect') {
      rule = z.array(z.string()).max(options.length || 50)
      // react-hook-form reports an untouched checkbox group as `false`, not `[]`,
      // so an optional one accepts that and `onSubmit` normalises it.
      if (field.required)
        shape[field.id] = rule.min(1, `Choose at least one option for ${field.label}`)
      else shape[field.id] = rule.optional().or(z.literal(false))
      continue
    }

    if (field.type === 'select' && options.length > 0) rule = z.enum(options)
    else if (field.type === 'email') rule = z.email('Enter a valid email address')
    else if (field.type === 'url') rule = z.url('Enter a full link starting with https://')
    else rule = z.string().trim()

    if (field.max && typeof rule.max === 'function') rule = rule.max(field.max)

    if (field.required) {
      shape[field.id] =
        field.type === 'select' || field.type === 'email' || field.type === 'url'
          ? rule
          : rule.min(1, `${field.label} is required`)
    } else {
      shape[field.id] = rule.optional().or(z.literal(''))
    }
  }

  return z.object(shape)
}

function Label({ field }) {
  return (
    <span className="text-sm font-medium text-text">
      {field.label}
      {field.required ? <span className="text-primary-text"> *</span> : null}
    </span>
  )
}

function Field({ field, error, registration }) {
  if (field.type === 'consent') {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-[var(--primary)]"
            {...registration}
          />
          <span>{field.label}</span>
        </label>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }

  if (field.type === 'multiselect') {
    return (
      <fieldset className="flex flex-col gap-2">
        <legend>
          <Label field={field} />
        </legend>
        {field.help && <p className="text-xs text-muted">{field.help}</p>}
        {(field.options ?? []).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              value={option}
              className="size-4 accent-[var(--primary)]"
              {...registration}
            />
            {option}
          </label>
        ))}
        {error && <p className="text-xs text-danger">{error}</p>}
      </fieldset>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={field.id}>
          <Label field={field} />
        </label>
        {field.help && <p className="text-xs text-muted">{field.help}</p>}
        <select
          id={field.id}
          className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          {...registration}
        >
          <option value="">Choose…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <Textarea label={field.label} hint={field.help} rows={4} error={error} {...registration} />
    )
  }

  const type =
    field.type === 'email'
      ? 'email'
      : field.type === 'tel'
        ? 'tel'
        : field.type === 'url'
          ? 'url'
          : 'text'
  return <Input type={type} label={field.label} hint={field.help} error={error} {...registration} />
}

export default function DynamicForm({
  fields,
  onSubmit,
  submitting = false,
  submitLabel = 'Send',
}) {
  const list = Array.isArray(fields) ? fields : []
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(buildSchema(list)) })

  function submit(values) {
    // An unchecked checkbox group arrives as `false`; store it as an empty list.
    for (const field of list) {
      if (field.type === 'multiselect' && !Array.isArray(values[field.id])) values[field.id] = []
    }
    return onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      {list.map((field) => (
        <Field
          key={field.id}
          field={field}
          error={errors[field.id]?.message}
          registration={register(field.id)}
        />
      ))}

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register('website')}
      />

      <Button type="submit" loading={submitting} className="self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
