export function isResumePdf(fileName, mimeType, file) {
  if (file?.type === 'application/pdf') return true;
  if (mimeType?.includes('pdf')) return true;
  return String(fileName || '').toLowerCase().endsWith('.pdf');
}

/** True when blob Content-Type is PDF or a generic type with a .pdf file name. */
export function responseLooksLikePdf(contentType, fileName) {
  const t = String(contentType || '').toLowerCase();
  if (t.includes('pdf')) return true;
  const pdfName = String(fileName || '').toLowerCase().endsWith('.pdf');
  if (!pdfName) return false;
  return (
    !t ||
    t === 'application/octet-stream' ||
    t === 'binary/octet-stream' ||
    t === 'application/download'
  );
}

/** Extract { message } from an axios error when responseType was blob. */
export async function messageFromBlobError(err) {
  const data = err?.response?.data;
  if (data instanceof Blob && data.type?.includes('json')) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      /* ignore */
    }
  }
  if (err?.response?.status === 401) {
    return 'Your session expired. Sign in again, then retry.';
  }
  return err?.response?.data?.message || err?.message || null;
}