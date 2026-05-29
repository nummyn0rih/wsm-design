import { useEffect, type FC } from 'react';

interface Props {
  message: string;
  tone?: 'info' | 'error';
  durationMs?: number;
  onDismiss?: () => void;
}

const TONE_STYLES: Record<'info' | 'error', { bg: string; border: string; color: string }> = {
  info: { bg: '#d4e6ed', border: '#7eb0c0', color: '#1a4868' },
  error: { bg: '#fbe0e0', border: '#e0a0a0', color: '#a02020' },
};

export const Toast: FC<Props> = ({ message, tone = 'info', durationMs = 4000, onDismiss }) => {
  useEffect(() => {
    if (!onDismiss) return;
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, durationMs]);
  const s = TONE_STYLES[tone];
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 14px',
        background: s.bg,
        border: `2px solid ${s.border}`,
        color: s.color,
        fontFamily: 'var(--font-handwriting)',
        fontSize: 14,
        zIndex: 1100,
        boxShadow: '2px 3px 0 rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  );
};
