import { useEffect, useRef, type FC, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  width?: number;
}

export const Modal: FC<Props> = ({ open, onClose, title, children, width = 480 }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '95vw',
          maxHeight: '90vh',
          background: 'var(--bg)',
          border: '2px solid var(--border)',
          boxShadow: '4px 6px 0 rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title && (
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1.5px solid var(--border)',
              fontFamily: 'var(--font-handwriting)',
              fontWeight: 700,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ flex: 1 }}>{title}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div className="wsm-scroll" style={{ padding: 12, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
