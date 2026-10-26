export interface CopyResult {
  success: boolean;
  method: 'navigator' | 'execCommand' | 'fallback_required';
  error?: string;
}

/**
 * Copies prompt text to the user's clipboard reliably with multiple fallbacks.
 * Only initiated by explicit user interaction (click/tap).
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  if (!text) {
    return { success: false, method: 'fallback_required', error: 'Empty text provided' };
  }

  // 1. Try modern navigator.clipboard API if supported and in secure context
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'navigator' };
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting legacy execCommand fallback', err);
    }
  }

  // 2. Legacy execCommand('copy') fallback using a temporary hidden textarea
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Prevent scrolling to bottom on iOS / mobile
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        return { success: true, method: 'execCommand' };
      }
    } catch (err) {
      console.warn('execCommand fallback failed', err);
    }
  }

  // 3. Fallback required: notify caller that a manual copy dialog should be presented
  return {
    success: false,
    method: 'fallback_required',
    error: 'Clipboard access not granted or unsupported by browser.',
  };
}
