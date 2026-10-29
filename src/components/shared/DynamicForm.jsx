import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

/**
 * Turns the stored question list into a Zod schema, so a form built in the admin
 * panel is validated exactly like a hand-written one.
 */
function buildSchema(fields) {
  const shape = {
    // Honeypot: hidden from people, irresistible to bots. `onSubmit` decides.
    website: z.string().optional(),
  }

  for (const field of fields) {
    const options = Array.isArray(field.options) && field.options.length > 0 ? field.options : null

    let rule
    if (field.type === 'select' && options) rule = z.enum(options)
    else if (field.type === 'email') rule = z.email('Enter a valid email address')
    else rule = z.string().trim().max(1000)

    if (field.required) {
      shape[field.id] =
        field.type === 'select' || field.type === 'email'
          ? rule
          : rule.min(1, `${field.label} is required`)
    } else {
      shape[field.id] = rule.optional().or(z.literal(''))
    }
  }

  return z.object(shape)
}

function Field({ field, error, registration }) {
  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={field.id} className="text-sm font-medium text-text">
          {field.label}
        </label>
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
    return <Textarea label={field.label} rows={4} error={error} {...registration} />
  }

  const type = field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'
  return <Input type={type} label={field.label} error={error} {...registration} />
}

export default function DynamicForm({
  fields,
  onSubmit,
  submitting = false,
  submitLabel = 'Send',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(buildSchema(fields)) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {fields.map((field) => (
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
