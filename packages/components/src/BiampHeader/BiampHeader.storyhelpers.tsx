import { Box, Button, Divider } from '@mui/material';
import {
  BiampBuildAppContent,
  BiampBuildAppContentItem,
  BiampEndUserAppContent,
  BiampEndUserAppContentItem,
} from './BiampHeader';
import {
  BookingApp,
  CommandApp,
  ConnectApp,
  DesignerApp,
  WorkplaceApp,
} from '@bwp-web/assets';

export const buildApps = [
  {
    image: WorkplaceApp,
    name: 'Workplace',
    description:
      'Monitor and manage your entire AV infrastructure in one place.',
    hasButton: false,
  },
  {
    image: DesignerApp,
    name: 'Designer',
    description: 'Design AV systems, specify equipment, generate BOMs.',
    hasButton: true,
  },
  {
    image: CommandApp,
    name: 'Command',
    description: 'Instantly send commands to Tesira devices from anywhere.',
    hasButton: true,
  },
  {
    image: ConnectApp,
    name: 'Connect',
    description:
      'Discover and add supported devices to Biamp Workplace organizations.',
    hasButton: true,
  },
];

export const endUserApps = [
  {
    image: BookingApp,
    name: 'Booking',
    description: 'Find & Book rooms',
    href: '#',
  },
];

export function AppPopoverContent() {
  return (
    <>
      <Divider>Configure &amp; Build</Divider>
      <BiampBuildAppContent>
        {buildApps.map((app, i) => (
          <BiampBuildAppContentItem
            key={i}
            name={app.name}
            description={app.description}
            image={
              <Box
                component="img"
                src={app.image}
                alt={app.name}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            }
            button={
              app.hasButton ? (
                <Button variant="outlined" size="small">
                  Open
                </Button>
              ) : undefined
            }
          />
        ))}
      </BiampBuildAppContent>
      <Divider>End user apps</Divider>
      <BiampEndUserAppContent>
        {endUserApps.map((app, i) => (
          <BiampEndUserAppContentItem
            key={i}
            name={app.name}
            description={app.description}
            href={app.href}
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
      </BiampEndUserAppContent>
    </>
  );
}
