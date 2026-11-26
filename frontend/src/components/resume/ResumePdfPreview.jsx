import { useEffect, useState } from 'react';
import { isResumePdf } from '../../utils/resumePreview';

/**
 * Inline PDF preview via object URL (local File or fetched blob).
 */
export default function ResumePdfPreview({
  title = 'Preview',
  file = null,
  loadBlob = null,
  refreshKey = '',
  className = '',
}) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          const type =
            res.headers['content-type']?.split(';')[0]?.trim() || 'application/pdf';
          if (!type.includes('pdf')) {
            if (!cancelled) setError('Preview is only available for PDF files.');
            return;
          }
          objectUrl = URL.createObjectURL(new Blob([res.data], { type }));
          if (!cancelled) setSrc(objectUrl);
        }
      } catch {
        if (!cancelled) setError('Could not load PDF preview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, loadBlob, refreshKey, isPdf]);

  if (!isPdf) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</p>
      <div
        className="overflow-hidden rounded-xl border border-border bg-bg-secondary"
        style={{ minHeight: '28rem' }}
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
            src={`${src}#toolbar=1&navpanes=0`}
            className="h-[28rem] w-full border-0 bg-white"
          />
        )}
      </div>
    </div>
  );
}