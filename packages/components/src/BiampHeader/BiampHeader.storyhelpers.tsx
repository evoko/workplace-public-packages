import { Box } from '@mui/material';
import { BiampAppListContent, BiampAppListItem } from './BiampHeader';
import {
  BookingApp,
  CommandApp,
  ConnectApp,
  ControlApp,
  DesignerApp,
  WorkplaceApp,
} from '@bwp-web/assets';

export const apps = [
  {
    image: WorkplaceApp,
    name: 'Workplace',
    hasButton: false,
  },
  {
    image: DesignerApp,
    name: 'Designer',
    hasButton: true,
  },
  {
    image: CommandApp,
    name: 'Command',
    hasButton: true,
  },
  {
    image: ControlApp,
    name: 'Control Designer',
    hasButton: true,
  },
  {
    image: BookingApp,
    name: 'Booking',
    hasButton: true,
  },
  {
    image: ConnectApp,
    name: 'Tools',
    hasButton: true,
    noExternalLink: true,
  },
];

export function AppPopoverContent() {
  return (
    <BiampAppListContent>
      {apps.map((app, i) => (
        <BiampAppListItem
          key={i}
          name={app.name}
          onOpen={app.hasButton ? () => {} : undefined}
          href={app.hasButton && !app.noExternalLink ? '#' : undefined}
          image={
            <Box
              component="img"
              src={app.image}
              alt={app.name}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          }
        />
      ))}
    </BiampAppListContent>
  );
}
