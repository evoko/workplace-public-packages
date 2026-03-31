import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Typography',
};

export default meta;
type Story = StoryObj;

const sampleText = 'The quick brown fox jumps over the lazy dog';

const variants = [
  {
    tag: 'h1',
    label: 'h1 (display/lg) -- Inter 3.75rem / 700',
    style: { fontSize: '3.75rem', fontWeight: 700 },
  },
  {
    tag: 'h2',
    label: 'h2 (display/md) -- Inter 3rem / 700',
    style: { fontSize: '3rem', fontWeight: 700 },
  },
  {
    tag: 'h3',
    label: 'h3 (display/sm) -- Inter 2.25rem / 700',
    style: { fontSize: '2.25rem', fontWeight: 700 },
  },
  {
    tag: 'h4',
    label: 'h4 (title/lg) -- Inter 1.875rem / 600',
    style: { fontSize: '1.875rem', fontWeight: 600 },
  },
  {
    tag: 'h5',
    label: 'h5 (title/md) -- Inter 1.5rem / 600',
    style: { fontSize: '1.5rem', fontWeight: 600 },
  },
  {
    tag: 'h6',
    label: 'h6 (title/sm) -- Inter 1.25rem / 600',
    style: { fontSize: '1.25rem', fontWeight: 600 },
  },
  {
    tag: 'p',
    label: 'subtitle1 (title/xs) -- Inter 1.125rem / 600',
    style: { fontSize: '1.125rem', fontWeight: 600 },
  },
  {
    tag: 'p',
    label: 'subtitle2 (label/md) -- Inter 0.875rem / 500',
    style: { fontSize: '0.875rem', fontWeight: 500 },
  },
  {
    tag: 'p',
    label: 'body1 (body/md) -- Inter 1rem / 400',
    style: { fontSize: '1rem', fontWeight: 400 },
  },
  {
    tag: 'p',
    label: 'body2 (body/sm) -- Inter 0.875rem / 400',
    style: { fontSize: '0.875rem', fontWeight: 400 },
  },
  {
    tag: 'span',
    label: 'caption (helper/sm) -- Inter 0.75rem / 400',
    style: { fontSize: '0.75rem', fontWeight: 400, display: 'block' as const },
  },
  {
    tag: 'span',
    label: 'overline (label/sm) -- Inter 0.75rem / 500 uppercase',
    style: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      display: 'block' as const,
    },
  },
  {
    tag: 'span',
    label: 'button (label/md) -- Inter 0.875rem / 500',
    style: { fontSize: '0.875rem', fontWeight: 500, display: 'block' as const },
  },
] as const;

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        fontFamily: 'var(--solar-font-sans)',
      }}
    >
      {variants.map(({ tag, label, style }) => (
        <div key={label}>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--solar-text-secondary)',
              marginBottom: 4,
            }}
          >
            {label}
          </span>
          <div
            role={tag.startsWith('h') ? 'heading' : undefined}
            aria-level={tag.startsWith('h') ? Number(tag[1]) : undefined}
            style={{
              ...style,
              margin: 0,
              color: 'var(--solar-text-default)',
              fontFamily: 'var(--solar-font-sans)',
            }}
          >
            {sampleText}
          </div>
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--solar-border-default)',
              marginTop: 16,
            }}
          />
        </div>
      ))}
    </div>
  ),
};

export const Heading1: Story = {
  render: () => (
    <h1
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '3.75rem',
        fontWeight: 700,
        color: 'var(--solar-text-default)',
        margin: 0,
      }}
    >
      Display Large
    </h1>
  ),
};

export const Heading2: Story = {
  render: () => (
    <h2
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '3rem',
        fontWeight: 700,
        color: 'var(--solar-text-default)',
        margin: 0,
      }}
    >
      Display Medium
    </h2>
  ),
};

export const Heading3: Story = {
  render: () => (
    <h3
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '2.25rem',
        fontWeight: 700,
        color: 'var(--solar-text-default)',
        margin: 0,
      }}
    >
      Display Small
    </h3>
  ),
};

export const Body1: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '1rem',
        fontWeight: 400,
        color: 'var(--solar-text-default)',
        margin: 0,
      }}
    >
      {sampleText}
    </p>
  ),
};

export const Body2: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '0.875rem',
        fontWeight: 400,
        color: 'var(--solar-text-default)',
        margin: 0,
      }}
    >
      {sampleText}
    </p>
  ),
};

export const Caption: Story = {
  render: () => (
    <span
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '0.75rem',
        fontWeight: 400,
        color: 'var(--solar-text-default)',
      }}
    >
      {sampleText}
    </span>
  ),
};
