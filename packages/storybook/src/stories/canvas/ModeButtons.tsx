import React from 'react';

export interface ModeButtonsProps<TMode extends string> {
  modes: Array<{ key: TMode; label: string }>;
  activeMode: TMode;
  onModeChange: (mode: TMode) => void;
}

export function ModeButtons<TMode extends string>({
  modes,
  activeMode,
  onModeChange,
}: ModeButtonsProps<TMode>) {
  return (
    <div>
      <span
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 4,
          color: 'var(--solar-text-default, #212121)',
        }}
      >
        Creation Mode
      </span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            style={{
              padding: '4px 10px',
              fontSize: 13,
              cursor: 'pointer',
              border: '1px solid var(--solar-border-default, #bdbdbd)',
              backgroundColor:
                activeMode === m.key
                  ? 'var(--solar-surface-primary, #1976d2)'
                  : 'transparent',
              color:
                activeMode === m.key
                  ? '#fff'
                  : 'var(--solar-text-default, #212121)',
              marginTop: -1,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
