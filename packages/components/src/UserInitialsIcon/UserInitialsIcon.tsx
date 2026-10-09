import { Box, BoxProps, Typography } from '@mui/material';
import { darken } from '@mui/material/styles';
import randomColor from 'randomcolor';
import { mergeSx } from '../slotProps';

type Props = BoxProps & {
  name: string;
  id: string;
  /** Icon width (px number or CSS length). @default 40 */
  width?: number | string;
  /** Icon height (px number or CSS length). @default 40 */
  height?: number | string;
  /** Corner radius (multiplier of theme.shape.borderRadius, or CSS length). @default 1.5 */
  borderRadius?: number | string;
};

const DEFAULT_SIZE = 40;
const DEFAULT_BORDER_RADIUS = 1.5;
const TEXT_RATIO = 0.4; // 16px (h3) / 40px default box

export function UserInitialsIcon({
  name,
  id,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  borderRadius = DEFAULT_BORDER_RADIUS,
  sx,
  ...props
}: Props) {
  const userInitials = getInitials(name);
  const bgColor = randomColor({ luminosity: 'light', seed: id });
  const textColor = darken(randomColor({ luminosity: 'dark', seed: id }), 0.3);

  const size = typeof width === 'number' ? width : DEFAULT_SIZE;
  const fontSize = size * TEXT_RATIO;

  return (
    <Box
      {...props}
      sx={mergeSx(
        {
          minWidth: width,
          width: width,
          minHeight: height,
          height: height,
          borderRadius: borderRadius,
          bgcolor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        sx,
      )}
    >
      <Typography
        variant="h3"
        sx={{
          color: textColor,
          userSelect: 'none',
          fontSize: size !== DEFAULT_SIZE ? `${fontSize}px` : undefined,
        }}
      >
        {userInitials}
      </Typography>
    </Box>
  );
}

const getInitials = (name: string) => {
  if (!name) return '--';
  const words = name.trim().split(/\s+/);

  const initials = words
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  return initials;
};
