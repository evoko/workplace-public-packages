import {
  Box,
  BoxProps,
  InputAdornment,
  ListItemButtonProps,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { JSX } from 'react';
import biampRedLogo from '../../public/BiampRedLogoIcon.png';
import { SearchIcon } from '../icons';
import { BiampListIcon } from '../BiampListIcon';

type BiampHeaderProps = StackProps & {
  children?: React.ReactNode;
};

export function BiampHeader({ children, sx, ...props }: BiampHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ px: 2.5, py: 1.5, ...sx }}
      {...props}
    >
      {children}
    </Stack>
  );
}

type BiampHeaderTitleProps = BoxProps & {
  icon?: JSX.Element;
  title: string;
};

export function BiampHeaderTitle({
  icon,
  title,
  sx,
  ...props
}: BiampHeaderTitleProps) {
  return (
    <Box sx={{ pr: 3, ...sx }} {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon ?? (
            <Box
              component="img"
              src={biampRedLogo}
              alt="Biamp"
              sx={{ width: 24, height: 24 }}
            />
          )}
        </Box>
        <Typography variant="h4">{title}</Typography>
      </Box>
    </Box>
  );
}

type BiampHeaderSearchProps = TextFieldProps;

export function BiampHeaderSearch({ sx, ...props }: BiampHeaderSearchProps) {
  return (
    <TextField
      size="small"
      placeholder="Search buildings…"
      fullWidth
      sx={{
        px: 1.5,
        '& .MuiOutlinedInput-root': {
          height: '40px !important',
          minHeight: '40px',
        },
        '& .MuiOutlinedInput-input': {
          height: '40px !important',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          height: '40px !important',
          border: 'none',
          boxShadow: 'none',
        },
        ...sx,
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}

type BiampHeaderActionsProps = BoxProps & {
  children: React.ReactNode;
};

export function BiampHeaderActions({
  children,
  sx,
  ...props
}: BiampHeaderActionsProps) {
  return (
    <Box
      sx={{
        pl: 3,
        gap: 3,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampHeaderButtonListProps = BoxProps & {
  children: React.ReactNode;
};

export function BiampHeaderButtonList({
  children,
  sx,
  ...props
}: BiampHeaderButtonListProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ...sx }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampHeaderButtonProps = ListItemButtonProps & {
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
  selected?: boolean;
};

export function BiampHeaderButton({
  icon,
  selectedIcon,
  selected,
  sx,
  ...props
}: BiampHeaderButtonProps) {
  return (
    <BiampListIcon
      icon={icon}
      selectedIcon={selectedIcon}
      selected={selected}
      sx={{
        minWidth: '40px',
        maxWidth: '40px',
        minHeight: '40px',
        maxHeight: '40px',
        '& .MuiSvgIcon-root': {
          width: '24px',
          height: '24px',
          fontSize: '24px',
        },
        ...sx,
      }}
      {...props}
    />
  );
}

type BiampHeaderProfileProps = BoxProps & {
  icon: JSX.Element;
  name: string;
};

export function BiampHeaderProfile({
  icon,
  name,
  sx,
  ...props
}: BiampHeaderProfileProps) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}
      {...props}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h4">{name}</Typography>
    </Box>
  );
}
