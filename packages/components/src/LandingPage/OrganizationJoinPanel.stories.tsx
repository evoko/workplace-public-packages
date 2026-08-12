import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { OrganizationJoinPanel } from './OrganizationJoinPanel';

const meta: Meta<typeof OrganizationJoinPanel> = {
  title: 'Components/OrganizationJoinPanel',
  component: OrganizationJoinPanel,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof OrganizationJoinPanel>;

type DemoProps = {
  /** The field's label. */
  title: string;
  /** An example value, since the label already names the field. */
  placeholder: string;
  submitLabel: string;
  /** Pre-fills the field so the submit button starts enabled. */
  initialValue?: string;
  /** Error text shown under the field, as an app would after a failed submit. */
  error?: string;
};

function FormDemo({
  title,
  placeholder,
  submitLabel,
  initialValue = '',
  error,
}: DemoProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <OrganizationJoinPanel
      title={title}
      field={{
        value,
        onChange: (event) => setValue(event.target.value),
        placeholder,
      }}
      error={error}
      cancelLabel="Cancel"
      submitLabel={submitLabel}
      onCancel={() => setValue('')}
      onSubmit={() => setValue('')}
    />
  );
}

/**
 * The join flow. The submit button stays disabled until the field has content —
 * type into it to enable "Ask to Join".
 *
 * The card carries only the field's label; the screen it replaces is named by
 * the page heading above it. On the landing page this card takes
 * `OrganizationsPanel`'s place rather than overlaying it — see the
 * OrganizationSelectorLandingPage story.
 */
export const Join: Story = {
  render: () => (
    <FormDemo
      title="Organization domain"
      placeholder="acme.com"
      submitLabel="Ask to Join"
    />
  ),
};

/**
 * Every label is a prop, so the panel's create action can reuse the same card —
 * only the copy differs. Kept as a story because the landing page drives both
 * flows through this component.
 */
export const Create: Story = {
  render: () => (
    <FormDemo
      title="Organization name"
      placeholder="Acme Corporation"
      submitLabel="Create"
    />
  ),
};

/**
 * A failed submit: the app passes `error`, which puts the field in its error
 * state and shows the message beneath it.
 */
export const WithError: Story = {
  render: () => (
    <FormDemo
      title="Organization domain"
      placeholder="acme.com"
      submitLabel="Ask to Join"
      initialValue="acme.example"
      error="No organization found with that domain"
    />
  ),
};
