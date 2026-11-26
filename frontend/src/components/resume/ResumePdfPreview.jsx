import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  isResumePdf,
  messageFromBlobError,
  responseLooksLikePdf,
} from '../../utils/resumePreview';

/**
 * Inline PDF preview via object URL (local File or fetched blob).
 */
export default function ResumePdfPreview({
  title = 'Preview',
  file = null,
  loadBlob = null,
  fileNameHint = '',
  mimeHint = '',
  refreshKey = '',
  className = '',
  compact = false,
  allowExpand = true,
  onOpenInNewTab = null,
}) {
  const frameHeight = compact ? 'h-80' : 'h-[28rem]';
  const minHeight = compact ? '20rem' : '28rem';
  const [src, setSrc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isPdf = file
    ? isResumePdf(file.name, file.type, file)
    : Boolean(loadBlob);

  useEffect(() => {
    if (!isPdf) {
      setSrc(null);
      return undefined;
    }

    let objectUrl;
    let cancelled = false;

    const run = async () => {
      setError('');
      setLoading(true);
      setSrc(null);

      try {
        if (file) {
          objectUrl = URL.createObjectURL(file);
          if (!cancelled) setSrc(objectUrl);
          return;
        }
        if (loadBlob) {
          const res = await loadBlob();
          const headerType =
            res.headers['content-type']?.split(';')[0]?.trim() || mimeHint || '';
          if (
            !responseLooksLikePdf(headerType, fileNameHint) &&
            !responseLooksLikePdf(mimeHint, fileNameHint)
          ) {
            if (!cancelled) setError('Preview is only available for PDF files.');
            return;
          }
          const blobType = headerType.includes('pdf')
            ? headerType
            : 'application/pdf';
          objectUrl = URL.createObjectURL(new Blob([res.data], { type: blobType }));
          if (!cancelled) setSrc(objectUrl);
        }
      } catch (err) {
        const detail = await messageFromBlobError(err);
        if (!cancelled) {
          setError(detail || 'Could not load PDF preview.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, loadBlob, refreshKey, isPdf, fileNameHint, mimeHint]);

  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  const handleOpenInNewTab = useCallback(async () => {
    if (onOpenInNewTab) {
      await onOpenInNewTab();
      return;
    }
    if (src) window.open(src, '_blank');
  }, [onOpenInNewTab, src]);

  const iframeSrc = src ? `${src}#toolbar=1&navpanes=0` : '';

  if (!isPdf) return null;

  const showActions = allowExpand && src && !loading && !error;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</p>
        {showActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs font-medium text-blue-text hover:underline"
            >
              Enlarge
            </button>
            <button
              type="button"
              onClick={() => void handleOpenInNewTab()}
              className="text-xs font-medium text-blue-text hover:underline"
            >
              New tab
            </button>
          </div>
        )}
      </div>
      <div
        className="overflow-hidden rounded-xl border border-border bg-bg-secondary"
        style={{ minHeight }}
      >
        {loading && (
          <p className="p-6 text-center text-sm text-text-muted">Loading preview…</p>
        )}
        {error && !loading && (
          <p className="p-6 text-center text-sm text-red-300">{error}</p>
        )}
        {src && !loading && (
          <iframe
            title={title}
            src={iframeSrc}
            className={`${frameHeight} w-full border-0 bg-white`}
          />
        )}
      </div>

      {expanded &&
        src &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — full size`}
            onClick={() => setExpanded(false)}
          >
            <div
              className="relative flex h-[min(92vh,56rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-bg-primary shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleOpenInNewTab()}
                    className="text-sm font-medium text-blue-text hover:underline"
                  >
                    Open in new tab
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
              <iframe
                title={`${title} (enlarged)`}
                src={iframeSrc}
                className="min-h-0 flex-1 w-full border-0 bg-white"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}