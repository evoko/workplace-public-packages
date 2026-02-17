import {
  alpha,
  Box,
  BoxProps,
  InputAdornment,
  ListItemButton,
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

type BiampAppDialogProps = BoxProps & {
  children: React.ReactNode;
};

export function BiampAppDialog({
  children,
  sx,
  ...props
}: BiampAppDialogProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 1.5,
        overflow: 'auto',
        maxWidth: '284px',
        borderRadius: '16px',
        backgroundColor: 'white',
        boxShadow: (theme) =>
          `0px 4px 24px 0px ${alpha(theme.palette.common.black, 0.15)}`,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampAppDialogItemProps = BoxProps & {
  icon: JSX.Element;
  name: string;
};

export function BiampAppDialogItem({
  icon,
  name,
  sx,
  ...props
}: BiampAppDialogItemProps) {
  return (
    <Box
      sx={{
        width: '76px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          width: '54px',
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiSvgIcon-root': {
            width: '54px',
            height: '54px',
            fontSize: '54px',
          },
        }}
      >
        {icon}
      </Box>
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
        {name}
      </Typography>
    </Box>
  );
}

type BiampHeaderProfileProps = ListItemButtonProps & {
  image: string;
  selected?: boolean;
};

export function BiampHeaderProfile({
  image,
  selected,
  sx,
  ...props
}: BiampHeaderProfileProps) {
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      sx={{
        minWidth: '36px',
        maxWidth: '36px',
        minHeight: '36px',
        maxHeight: '36px',
        borderRadius: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      <Box
        component="img"
        src={image}
        alt={'Profile Image'}
        sx={{
          width: 32,
          height: 32,
          borderRadius: '4px',
          border: (theme) =>
            `0.6px solid var(--Divider-divider_primary, ${alpha(theme.palette.background.paper, 0.15)})`,
        }}
      />
    </ListItemButton>
  );
}
