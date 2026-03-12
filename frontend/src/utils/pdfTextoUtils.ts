/**
 * Remove caracteres invisíveis e formatação indesejada de texto colado de Word/PDF.
 * Caracteres como U+200B (Zero Width Space) quebram o layout do jsPDF.
 */
export function sanitizarTextoParaPdf(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u200B-\u200D\uFEFF\u2060\u2062\u2063\u00AD]/g, '') // Zero-width e invisíveis
    .replace(/\u00A0/g, ' ') // Non-breaking space → espaço normal
    .trim();
}
