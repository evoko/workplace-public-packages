import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Shadows',
};

export default meta;
type Story = StoryObj;

const shadowTokens = [
  { name: 'subtle', cssVar: '--solar-shadow-subtle' },
  { name: 'control', cssVar: '--solar-shadow-control' },
  { name: 'focus', cssVar: '--solar-shadow-focus' },
  { name: 'danger', cssVar: '--solar-shadow-danger' },
  { name: 'warning', cssVar: '--solar-shadow-warning' },
  { name: 'modal', cssVar: '--solar-shadow-modal' },
  { name: 'strong', cssVar: '--solar-shadow-strong' },
];

const ShadowSwatch = ({ name, cssVar }: { name: string; cssVar: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--solar-font-sans)',
    }}
  >
    <div
      style={{
        width: 160,
        height: 80,
        borderRadius: 'var(--solar-radius-base)',
        backgroundColor: 'var(--solar-surface-default)',
        boxShadow: `var(${cssVar})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        color: 'var(--solar-text-secondary)',
      }}
    >
      {name}
    </div>
    <span
      style={{
        fontSize: '0.75rem',
        color: 'var(--solar-text-tertiary)',
        maxWidth: 160,
        textAlign: 'center',
        wordBreak: 'break-all',
      }}
    >
      {cssVar}
    </span>
  </div>
);

export const AllShadows: Story = {
  name: 'Shadow tokens',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Shadow tokens (SOLAR CSS variables)
      </h6>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {shadowTokens.map((t) => (
          <ShadowSwatch key={t.name} {...t} />
        ))}
      </div>
    </div>
  ),
};
