import { useId, useState } from 'react';

function ImageIcon() {
  return (
    <svg className="mx-auto h-11 w-11 text-blue-text" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="8"
        y="12"
        width="32"
        height="28"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="18" cy="22" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 32l10-8 8 6 8-10 6 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      className="mx-auto h-11 w-11 text-blue-text"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M14 6a2 2 0 0 1 2-2h14l10 10v26a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M30 4v10h10M18 26h12M18 32h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FileDropZone({
  accept,
  inputId,
  file,
  onFileSelect,
  chooseLabel,
  hint,
  variant = 'document',
  compact = false,
  disabled = false,
  className = '',
}) {
  const defaults =
    variant === 'image'
      ? {
          chooseLabel: 'Choose a photo',
          hint: 'PNG, JPG, or WEBP · up to 5 MB',
        }
      : {
          chooseLabel: 'Choose a file',
          hint: 'PDF, DOCX, or TXT · up to 5 MB',
        };
  const labelText = chooseLabel ?? defaults.chooseLabel;
  const hintText = hint ?? defaults.hint;
  const Icon = variant === 'image' ? ImageIcon : DocumentIcon;
  const autoId = useId();
  const id = inputId || autoId;
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (files) => {
    const next = files?.[0];
    if (next) onFileSelect(next);
  };

  return (
    <div
      className={`file-drop-zone rounded-2xl border-2 border-dashed text-center transition-colors ${
        compact ? 'px-4 py-6' : 'px-6 py-10'
      } ${dragOver ? 'is-drag-over' : ''} ${disabled ? 'pointer-events-none opacity-60' : ''} ${className}`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        pickFile(e.dataTransfer.files);
      }}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          pickFile(e.target.files);
          e.target.value = '';
        }}
      />

      <label htmlFor={id} className="block cursor-pointer select-none">
        <Icon />
        <p className={`text-sm leading-relaxed text-text-secondary ${compact ? 'mt-3' : 'mt-5'}`}>
          <span className="font-semibold text-blue-text">{labelText}</span>
          <span> or drag and drop here</span>
        </p>
        <p className="mt-2 text-xs text-text-muted">{hintText}</p>

        {file && (
          <p className="mt-5 rounded-xl border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </label>
    </div>
  );
}