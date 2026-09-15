import { useEffect, useState } from 'react';

/**
 * Detects when the on-screen keyboard is likely open
 * by combining input focus tracking with visualViewport resize events.
 *
 * Returns true when:
 *  - An input/textarea/select is currently focused, OR
 *  - The visual viewport has shrunk significantly (likely due to keyboard)
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let inputFocused = false;
    let viewportShrunk = false;

    const update = () => setOpen(inputFocused || viewportShrunk);

    const isInputElement = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return false;
      // Skip range / checkbox / radio / button-like inputs (no keyboard)
      if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type;
        if (
          type === 'range' || type === 'checkbox' || type === 'radio' ||
          type === 'button' || type === 'submit' || type === 'reset'
        ) return false;
      }
      return true;
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (isInputElement(e.target as Element)) {
        inputFocused = true;
        update();
      }
    };

    const handleFocusOut = () => {
      // Slight delay so focus can move between inputs without flicker
      window.setTimeout(() => {
        inputFocused = isInputElement(document.activeElement);
        update();
      }, 80);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    // Visual viewport resize fallback (Android Chrome / WebView)
    const initialHeight = window.innerHeight;
    const handleVVResize = () => {
      if (!window.visualViewport) return;
      const heightDiff = initialHeight - window.visualViewport.height;
      viewportShrunk = heightDiff > 150;
      update();
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVVResize);
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVVResize);
      }
    };
  }, []);

  return open;
}
