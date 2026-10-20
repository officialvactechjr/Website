import { Link } from 'react-router-dom'
import { Image } from 'lucide-react'

/**
 * The title links to the detail page and the GitHub link sits beside it.
 * Deliberately NOT one big link: an <a> inside an <a> is invalid HTML.
 */
export default function ProjectCard({ project }) {
  return (
    <article className="flex flex-col rounded-sm border border-border bg-surface transition-colors hover:border-primary">
      {project.image_url ? (
        <img
          src={project.image_url}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-t-sm object-cover"
        />
      ) : (
        <div className="grid aspect-video w-full place-items-center rounded-t-sm bg-surface-alt">
          <Image className="size-6 text-muted" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-semibold">
          <Link
            to={`/projects/${project.id}`}
            className="transition-colors hover:text-primary-text"
          >
            {project.title}
          </Link>
        </h3>

        {project.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted">{project.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 text-xs text-muted">
          <span>
            <span className="font-medium text-text">{project.owner_name}</span>
            {project.owner_class && (
              <>
                {' · '}Class {project.owner_class}
                {project.owner_section ? ` · ${project.owner_section}` : ''}
              </>
            )}
          </span>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-primary-text hover:underline"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
