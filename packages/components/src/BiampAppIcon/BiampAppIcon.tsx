import { ListItemButton, ListItemButtonProps, Typography } from '@mui/material';
import { JSX } from 'react';

type BiampAppIconProps = ListItemButtonProps & {
  icon: JSX.Element;
  label: string;
};

export function BiampAppIcon({ icon, label, sx, ...props }: BiampAppIconProps) {
  return (
    <ListItemButton
      disableGutters
      disableRipple
      sx={{
        minWidth: '76px',
        maxWidth: '76px',
        minHeight: '89px',
        maxHeight: '89px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        '& .MuiSvgIcon-root': {
          width: '54px',
          height: '54px',
          fontSize: '54px',
        },
        ...sx,
      }}
      {...props}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{
          textAlign: 'center',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {label}
      </Typography>
    </ListItemButton>
  );
}
