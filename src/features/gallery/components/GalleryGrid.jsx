export default function GalleryGrid({ photos, onOpen }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo, index) => (
        <li key={photo.id}>
          <button type="button" onClick={() => onOpen(index)} className="group w-full text-left">
            <img
              src={photo.image_url}
              alt={photo.title ?? 'Club photo'}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm border border-border object-cover transition-colors group-hover:border-primary"
            />
            {photo.title && (
              <span className="mt-2 block text-sm font-medium transition-colors group-hover:text-primary-text">
                {photo.title}
              </span>
            )}
            {photo.caption && <span className="block text-xs text-muted">{photo.caption}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}
