import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { OrganizationCreatePanel } from './OrganizationCreatePanel';

const meta: Meta<typeof OrganizationCreatePanel> = {
  title: 'Components/OrganizationCreatePanel',
  component: OrganizationCreatePanel,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof OrganizationCreatePanel>;

const regions = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'North America' },
  { value: 'apac', label: 'Asia Pacific' },
];

type DemoProps = {
  /** Pre-fills the three fields so the submit button starts enabled. */
  filled?: boolean;
  /** Error text under the domain field, as an app would after a failed submit. */
  domainError?: string;
};

function CreateDemo({ filled = false, domainError }: DemoProps) {
  const [region, setRegion] = useState(filled ? 'eu' : '');
  const [name, setName] = useState(filled ? 'Acme Corporation' : '');
  const [domain, setDomain] = useState(filled ? 'acme.com' : '');
  const [discoverable, setDiscoverable] = useState(false);

  return (
    <OrganizationCreatePanel
      region={{
        label: 'Data Region',
        value: region,
        onChange: (event) => setRegion(event.target.value),
        placeholder: 'Select a region',
        options: regions,
      }}
      name={{
        label: 'Organization name',
        value: name,
        onChange: (event) => setName(event.target.value),
        placeholder: 'Acme Corporation',
      }}
      domain={{
        label: 'Organization domain',
        value: domain,
        onChange: (event) => setDomain(event.target.value),
        placeholder: 'acme.com',
        error: domainError,
      }}
      checkbox={{
        checked: discoverable,
        onChange: (_event, checked) => setDiscoverable(checked),
        label: 'Let anyone with this domain find and join this organization',
      }}
      cancelLabel="Cancel"
      submitLabel="Create"
      onCancel={() => undefined}
      onSubmit={() => undefined}
    />
  );
}

/**
 * Empty to start: "Create" stays disabled until a region is chosen and both text
 * fields have content. The checkbox is independent — it does not gate submission.
 *
 * On the landing page this card takes `OrganizationsPanel`'s place rather than
 * overlaying it — see the OrganizationSelectorLandingPage story.
 */
export const Default: Story = {
  render: () => <CreateDemo />,
};

/** All three fields filled, so the primary button is live. */
export const Filled: Story = {
  render: () => <CreateDemo filled />,
};

/**
 * A failed submit: the app passes `error` on the field at fault, which puts that
 * field in its error state and shows the message beneath it.
 */
export const WithError: Story = {
  render: () => (
    <CreateDemo filled domainError="That domain is already registered" />
  ),
};
