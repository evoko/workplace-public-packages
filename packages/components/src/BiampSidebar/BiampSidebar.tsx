import { Stack } from '@mui/material';
import { BiampLogoIcon } from '../icons';

export function BiampSidebar() {
  return (
    <Stack width="48px" height="100%" sx={{ backgroundColor: 'red' }}>
      <Stack height="100%"></Stack>
      <BiampLogoIcon sx={{ width: '48px', height: '15px' }} />
    </Stack>
  );
}
