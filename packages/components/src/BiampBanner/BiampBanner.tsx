import React from 'react';
import {
  Box,
  BoxProps,
  Collapse,
  Typography,
  TypographyProps,
  type AlertColor,
} from '@mui/material';
import {
  ErrorStatusIcon,
  InfoStatusIcon,
  SuccessStatusIcon,
  WarningStatusIcon,
} from '@bwp-web/assets';

export type BiampBannerProps = {
  show: boolean;
  children: React.ReactNode;
  severity: AlertColor;
};

/**
 * A full-width notification banner that slides in/out with a Collapse animation.
 * Uses MUI's AlertColor severity to set background and text colors from the theme.
 * Compose with `BiampBannerIcon`, `BiampBannerContent`, and `BiampBannerActions`.
 */
export function BiampBanner({ show, children, severity }: BiampBannerProps) {
  return (
    <Collapse in={show} unmountOnExit component="aside">
      <Box
        bgcolor={({ palette }) => palette.background[severity]}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        px={{ xs: 2, sm: 2.5 }}
        minHeight={48}
        sx={{
          borderBottom: ({ palette }) =>
            `0.6px solid ${palette[severity].main}`,
        }}
      >
        {children}
      </Box>
    </Collapse>
  );
}

// NOTE: we're using the same icon mapping as the `Alert` component.
const iconMapping: Record<AlertColor, React.ReactNode> = {
  error: <ErrorStatusIcon color="error" sx={{ width: 14, height: 14 }} />,
  warning: <WarningStatusIcon color="warning" sx={{ width: 16, height: 14 }} />,
  success: <SuccessStatusIcon color="success" sx={{ width: 14, height: 14 }} />,
  info: <InfoStatusIcon color="info" sx={{ width: 14, height: 14 }} />,
};

export type BiampBannerIconProps = {
  severity?: AlertColor;
  children?: React.ReactNode;
};

/**
 * Icon slot for `BiampBanner`. Pass a `severity` to render the matching
 * default icon, or pass `children` to render a custom icon.
 */
export function BiampBannerIcon({ severity, children }: BiampBannerIconProps) {
  return <>{severity ? iconMapping[severity] : children}</>;
}

/**
 * Content slot for `BiampBanner`. Text is centered by default.
 */
export function BiampBannerContent({ children, ...props }: TypographyProps) {
  return (
    <Typography textAlign="center" variant="h3" {...props}>
      {children}
    </Typography>
  );
}

/**
 * Actions slot for `BiampBanner`. Renders children in a horizontal flex row
 * with 8px gap, aligned to the trailing edge of the banner.
 */
export function BiampBannerActions({ children, ...props }: BoxProps) {
  return (
    <Box display="flex" gap={1} alignItems="center" {...props}>
      {children}
    </Box>
  );
}
