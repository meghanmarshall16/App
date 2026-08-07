interface IconProps {
  className?: string
  title?: string
}

/** Classic dog paw print */
export function PawIcon({ className = '', title }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M12 14.5c-2.6 0-5.2 1.35-5.2 3.55 0 1.7 1.55 2.95 5.2 2.95s5.2-1.25 5.2-2.95c0-2.2-2.6-3.55-5.2-3.55zm-5.85-3.2c.95 0 1.85-.95 2.15-2.35.3-1.4-.15-2.7-1.05-2.95-.9-.25-1.9.7-2.25 2.1-.35 1.45.15 2.75 1.15 3.2zm11.7 0c1 0 1.5-1.3 1.15-2.75-.35-1.4-1.35-2.35-2.25-2.1-.9.25-1.35 1.55-1.05 2.95.3 1.4 1.2 2.35 2.15 2.35zM8.85 8.1c1.05 0 1.85-1.15 1.85-2.65S9.9 2.8 8.85 2.8 7 3.95 7 5.45s.8 2.65 1.85 2.65zm6.3 0c1.05 0 1.85-1.15 1.85-2.65S16.2 2.8 15.15 2.8 13.3 3.95 13.3 5.45s.8 2.65 1.85 2.65z"
      />
    </svg>
  )
}

/** Plane silhouette for pilot trips */
export function PlaneIcon({ className = '', title }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
      />
    </svg>
  )
}

/** Combined plane + paw brand mark */
export function BrandMarkIcon({ className = '' }: IconProps) {
  return (
    <span className={`brand-duo ${className}`} aria-hidden="true">
      <PlaneIcon className="brand-duo__plane" />
      <PawIcon className="brand-duo__paw" />
    </span>
  )
}
