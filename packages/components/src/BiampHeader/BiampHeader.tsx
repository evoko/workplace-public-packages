import {
  alpha,
  Box,
  BoxProps,
  InputAdornment,
  ListItemButton,
  ListItemButtonProps,
  Popover,
  PopoverProps,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { JSX } from 'react';
import { biampRedLogo, SearchIcon } from '@bwp-web/assets';

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
      placeholder="Search..."
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
        gap: 2,
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
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      sx={{
        minWidth: '40px',
        maxWidth: '40px',
        minHeight: '40px',
        maxHeight: '40px',
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {selected ? displayedSelectedIcon : icon}
    </ListItemButton>
  );
}

type BiampAppPopoverProps = PopoverProps & {
  children: React.ReactNode;
};

export function BiampAppPopover({
  children,
  open,
  sx,
  ...props
}: BiampAppPopoverProps) {
  return (
    <Popover
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ ...sx }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            backgroundImage: 'none',
            border: ({ palette }) => `0.6px solid ${palette.divider}`,
            boxShadow: ({ palette }) =>
              `0px 4px 24px 0px ${alpha(palette.common.black, 0.15)};`,
          },
        },
      }}
      {...props}
    >
      {children}
    </Popover>
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
        p: 2,
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 1.5,
        maxWidth: '284px',
        borderRadius: '16px',
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[800] : palette.common.white,
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
        height: '89px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '12px',
        border: '0.6px solid transparent',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ':hover': {
          backgroundColor: ({ palette }) => alpha(palette.info.main, 0.1),
          borderColor: ({ palette }) => palette.info.main,
        },
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
        fontWeight={600}
        sx={{
          textAlign: 'center',
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
          border: ({ palette }) =>
            `0.6px solid var(--Divider-divider_primary, ${alpha(palette.background.paper, 0.15)})`,
        }}
      />
    </ListItemButton>
  );
}
