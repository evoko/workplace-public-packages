import {
  alpha,
  Box,
  BoxProps,
  Grid,
  GridProps,
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

type BiampAppDialogProps = GridProps & {
  children: React.ReactNode;
};

export function BiampAppDialog({
  children,
  sx,
  ...props
}: BiampAppDialogProps) {
  return (
    <Grid
      container
      columns={3}
      spacing={2}
      rowSpacing={1.5}
      columnSpacing={1.5}
      sx={{
        overflow: 'auto',
        width: '284px',
        borderRadius: '16px',
        backgroundColor: 'white',
        boxShadow: (theme) =>
          `0px 4px 24px 0px ${alpha(theme.palette.common.black, 0.15)}`,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Grid>
  );
}

type BiampAppDialogItemProps = GridProps & {
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
    <Grid
      size={1}
      sx={{
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
    </Grid>
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
