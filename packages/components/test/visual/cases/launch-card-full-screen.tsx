import { appIconWorkplace } from '@bwp-web/assets';
import oracle from '../../../../../spec/verify/launch-card-full-screen.json';
import { Button } from '../../../src/Button.js';
import { IconButton } from '../../../src/IconButton.js';
import { LaunchCardFullScreen } from '../../../src/LaunchCardFullScreen.js';
import { icon, picture } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's words, a stand-in picture, the App Icon of Workplace, its favourite and its Button; as
// wide as Figma draws it.
export default {
  oracle,
  render: () => (
    <LaunchCardFullScreen
      name="Workplace"
      intro="Book rooms and desks, and find your colleagues."
      features={[
        'Feature example 01',
        'Feature example 02',
        'Feature example 03',
      ]}
      image={picture}
      appIcon={<img src={appIconWorkplace} alt="" />}
      favourite={
        <IconButton
          size="md"
          shape="round"
          variant="tertiary"
          icon={icon}
          aria-label="Favourite"
        />
      }
      action={<Button>Open</Button>}
      style={{ width: 979 }}
    />
  ),
} satisfies VisualCase;
