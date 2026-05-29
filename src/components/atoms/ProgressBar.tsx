import type { FC } from 'react';

interface Props {
  pct: number;
  barColor: string;
  ariaLabel?: string;
}

const MAX_SCALE = 150;
const MARKER_PCT = (100 / MAX_SCALE) * 100;

export const ProgressBar: FC<Props> = ({ pct, barColor, ariaLabel }) => {
  const clamped = Math.max(0, pct);
  const fillBase = Math.min(100, clamped);
  const fillWidth = (fillBase / MAX_SCALE) * 100;
  const overStart = (100 / MAX_SCALE) * 100;
  const overEndPct = Math.min(MAX_SCALE, clamped);
  const overWidth = ((overEndPct - 100) / MAX_SCALE) * 100;
  const hasOver = clamped > 100;
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={MAX_SCALE}
      aria-valuenow={Math.round(clamped)}
      style={{
        position: 'relative',
        width: '100%',
        height: 8,
        border: '1px solid #b8b4a8',
        background: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${fillWidth}%`,
          background: barColor,
        }}
      />
      {hasOver && (
        <div
          style={{
            position: 'absolute',
            left: `${overStart}%`,
            top: 0,
            bottom: 0,
            width: `${overWidth}%`,
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent 0 4px, rgba(192, 104, 32, 0.3) 4px 8px)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: `${MARKER_PCT}%`,
          top: 0,
          bottom: 0,
          width: 1,
          background: '#333',
        }}
      />
    </div>
  );
};
