export function isResumePdf(fileName, mimeType, file) {
  if (file?.type === 'application/pdf') return true;
  if (mimeType?.includes('pdf')) return true;
  return String(fileName || '').toLowerCase().endsWith('.pdf');
}