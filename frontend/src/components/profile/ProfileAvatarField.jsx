import { useId, useState } from 'react';

const ACCEPT = 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';

function avatarInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return '';
}

function UserSilhouette() {
  return (
    <svg className="h-10 w-10 text-blue-text/70" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10 40c2.5-8 7.5-12 14-12s11.5 4 14 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProfileAvatarField({
  avatar,
  name,
  onUpload,
  onClear,
  onAvatarUrlChange,
  disabled = false,
  uploading = false,
}) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);
  const initials = avatarInitials(name);

  const pickFile = (files) => {
    const file = files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="space-y-3">
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        disabled={disabled || uploading}
        className="sr-only"
        onChange={(e) => {
          pickFile(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        className={`relative rounded-2xl border border-border bg-gradient-to-br from-blue-light/40 via-bg-card to-bg-secondary/80 p-4 shadow-sm transition-colors sm:p-5 ${
          dragOver ? 'border-blue-primary/50 bg-blue-light/30' : ''
        } ${disabled ? 'opacity-60' : ''}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) pickFile(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label
            htmlFor={inputId}
            className={`relative mx-auto shrink-0 sm:mx-0 ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
            title="Choose a photo"
          >
            <span className="relative block h-24 w-24 overflow-hidden rounded-full ring-2 ring-blue-primary/20 ring-offset-2 ring-offset-bg-card sm:h-28 sm:w-28">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-light to-bg-secondary">
                  {initials ? (
                    <span className="text-2xl font-bold tracking-tight text-blue-text">{initials}</span>
                  ) : (
                    <UserSilhouette />
                  )}
                </span>
              )}
            </span>
            {!disabled && (
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-blue-text shadow-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              </span>
            )}
          </label>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-base font-semibold text-text-primary">
              {avatar ? 'Your profile photo' : 'Add a profile photo'}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              PNG, JPG, or WEBP · up to 5 MB · saves when uploaded
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <label
                htmlFor={inputId}
                className={`btn-brand inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  disabled || uploading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                {uploading ? 'Uploading…' : 'Choose photo'}
              </label>
              {avatar && (
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={onClear}
                  className="rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-text-muted">Or drag an image onto this card.</p>
          </div>
        </div>
      </div>

      <details className="rounded-xl border border-border bg-bg-secondary px-4 py-3">
        <summary className="cursor-pointer select-none text-sm text-text-secondary">
          Paste an image URL instead
        </summary>
        <div className="mt-3">
          <input
            value={avatar}
            onChange={(e) => onAvatarUrlChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            disabled={disabled}
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
          />
          <p className="mt-2 text-xs text-text-muted">
            Use a direct link ending in .png, .jpg, or .webp, then save your profile.
          </p>
        </div>
      </details>
    </div>
  );
}