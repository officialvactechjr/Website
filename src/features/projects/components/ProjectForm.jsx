import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ImageUpload from '../../../components/shared/ImageUpload'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import { useAuth } from '../../../context/useAuth'
import { projectSchema } from '../schema'

const EMPTY = { title: '', description: '', image_url: '', github_url: '' }

/**
 * The one project form, used for uploading and for editing. The image goes into
 * `project-images/{userId}/`, which is the only place a member may write.
 */
export default function ProjectForm({ defaultValues = EMPTY, submitLabel, onSubmit, notice }) {
  const { profile } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    values: { ...EMPTY, ...defaultValues },
  })

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Input
          label="Title"
          hint="What the project is called."
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          rows={5}
          hint="What it does, and anything you are proud of."
          error={errors.description?.message}
          {...register('description')}
        />

        <Controller
          control={control}
          name="image_url"
          render={({ field }) => (
            <ImageUpload
              bucket="project-images"
              folder={profile.id}
              label="Project image"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />

        <Input
          label="GitHub link"
          placeholder="https://github.com/…"
          hint="Optional, but it is what visitors click."
          error={errors.github_url?.message}
          {...register('github_url')}
        />

        {notice}

        <div>
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
