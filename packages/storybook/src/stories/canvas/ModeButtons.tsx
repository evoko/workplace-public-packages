import React from 'react';
import { Button, ButtonGroup, Typography } from '@mui/material';

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
      <Typography variant="subtitle2" gutterBottom>
        Creation Mode
      </Typography>
      <ButtonGroup orientation="vertical" fullWidth size="small">
        {modes.map((m) => (
          <Button
            key={m.key}
            variant={activeMode === m.key ? 'contained' : 'outlined'}
            onClick={() => onModeChange(m.key)}
          >
            {m.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
