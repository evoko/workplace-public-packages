import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Colors',
};

export default meta;
type Story = StoryObj;

const Swatch = ({
  cssVar,
  label,
  bordered,
}: {
  cssVar: string;
  label: string;
  bordered?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 100,
      fontFamily: 'var(--solar-font-sans)',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--solar-radius-sm)',
        backgroundColor: `var(${cssVar})`,
        border: bordered ? '1px solid var(--solar-border-default)' : 'none',
      }}
    />
    <span
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--solar-text-default)',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '0.7rem',
        color: 'var(--solar-text-secondary)',
        wordBreak: 'break-all',
        textAlign: 'center',
      }}
    >
      {cssVar}
    </span>
  </div>
);

const ColorGroup = ({
  title,
  swatches,
}: {
  title: string;
  swatches: { cssVar: string; label: string; bordered?: boolean }[];
}) => (
  <div style={{ marginBottom: 32 }}>
    <h5
      style={{
        fontFamily: 'var(--solar-font-sans)',
        color: 'var(--solar-text-default)',
        fontSize: '1.25rem',
        fontWeight: 600,
        margin: '0 0 12px',
      }}
    >
      {title}
    </h5>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {swatches.map((s) => (
        <Swatch key={s.label} {...s} />
      ))}
    </div>
  </div>
);

export const Palette: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: 'var(--solar-font-sans)',
      }}
    >
      {/* Semantic: Surface */}
      <ColorGroup
        title="Surface"
        swatches={[
          {
            cssVar: '--solar-surface-default',
            label: 'default',
            bordered: true,
          },
          {
            cssVar: '--solar-surface-secondary',
            label: 'secondary',
            bordered: true,
          },
          { cssVar: '--solar-surface-tertiary', label: 'tertiary' },
          {
            cssVar: '--solar-surface-overlay',
            label: 'overlay',
            bordered: true,
          },
          { cssVar: '--solar-surface-inverse', label: 'inverse' },
          { cssVar: '--solar-surface-brand', label: 'brand' },
          {
            cssVar: '--solar-surface-brand-subtle',
            label: 'brand-subtle',
            bordered: true,
          },
        ]}
      />

      {/* Semantic: Status surfaces */}
      <ColorGroup
        title="Status Surfaces"
        swatches={[
          { cssVar: '--solar-surface-danger', label: 'danger', bordered: true },
          {
            cssVar: '--solar-surface-warning',
            label: 'warning',
            bordered: true,
          },
          {
            cssVar: '--solar-surface-success',
            label: 'success',
            bordered: true,
          },
          { cssVar: '--solar-surface-info', label: 'info', bordered: true },
        ]}
      />

      {/* Semantic: Text */}
      <ColorGroup
        title="Text"
        swatches={[
          { cssVar: '--solar-text-default', label: 'default' },
          { cssVar: '--solar-text-secondary', label: 'secondary' },
          { cssVar: '--solar-text-tertiary', label: 'tertiary' },
          { cssVar: '--solar-text-disabled', label: 'disabled' },
          { cssVar: '--solar-text-inverse', label: 'inverse', bordered: true },
          { cssVar: '--solar-text-brand', label: 'brand' },
          { cssVar: '--solar-text-danger', label: 'danger' },
          { cssVar: '--solar-text-warning', label: 'warning' },
          { cssVar: '--solar-text-success', label: 'success' },
          { cssVar: '--solar-text-info', label: 'info' },
          { cssVar: '--solar-text-link', label: 'link' },
        ]}
      />

      {/* Semantic: Border */}
      <ColorGroup
        title="Border"
        swatches={[
          { cssVar: '--solar-border-default', label: 'default' },
          { cssVar: '--solar-border-secondary', label: 'secondary' },
          { cssVar: '--solar-border-strong', label: 'strong' },
          { cssVar: '--solar-border-inverse', label: 'inverse' },
          { cssVar: '--solar-border-brand', label: 'brand' },
          { cssVar: '--solar-border-danger', label: 'danger' },
          { cssVar: '--solar-border-warning', label: 'warning' },
          { cssVar: '--solar-border-success', label: 'success' },
          { cssVar: '--solar-border-info', label: 'info' },
        ]}
      />

      {/* Semantic: Action Primary */}
      <ColorGroup
        title="Action — Primary"
        swatches={[
          { cssVar: '--solar-action-primary-bg', label: 'bg' },
          { cssVar: '--solar-action-primary-bg-hover', label: 'bg-hover' },
          { cssVar: '--solar-action-primary-bg-active', label: 'bg-active' },
          {
            cssVar: '--solar-action-primary-bg-disabled',
            label: 'bg-disabled',
          },
          { cssVar: '--solar-action-primary-bg-danger', label: 'bg-danger' },
          {
            cssVar: '--solar-action-primary-bg-danger-hover',
            label: 'danger-hover',
          },
        ]}
      />

      {/* Semantic: Action Secondary */}
      <ColorGroup
        title="Action — Secondary"
        swatches={[
          {
            cssVar: '--solar-action-secondary-bg-hover',
            label: 'bg-hover',
            bordered: true,
          },
          {
            cssVar: '--solar-action-secondary-bg-active',
            label: 'bg-active',
            bordered: true,
          },
          {
            cssVar: '--solar-action-secondary-bg-disabled',
            label: 'bg-disabled',
          },
          {
            cssVar: '--solar-action-secondary-bg-danger-hover',
            label: 'danger-hover',
            bordered: true,
          },
        ]}
      />

      {/* Primitive: Brand */}
      <ColorGroup
        title="Brand (Primitives)"
        swatches={[
          { cssVar: '--solar-brand-50', label: '50', bordered: true },
          { cssVar: '--solar-brand-100', label: '100', bordered: true },
          { cssVar: '--solar-brand-200', label: '200' },
          { cssVar: '--solar-brand-300', label: '300' },
          { cssVar: '--solar-brand-400', label: '400' },
          { cssVar: '--solar-brand-500', label: '500' },
          { cssVar: '--solar-brand-600', label: '600' },
          { cssVar: '--solar-brand-700', label: '700' },
          { cssVar: '--solar-brand-800', label: '800' },
          { cssVar: '--solar-brand-900', label: '900' },
        ]}
      />

      {/* Primitive: Neutral */}
      <ColorGroup
        title="Neutral (Primitives)"
        swatches={[
          { cssVar: '--solar-neutral-50', label: '50', bordered: true },
          { cssVar: '--solar-neutral-100', label: '100', bordered: true },
          { cssVar: '--solar-neutral-200', label: '200', bordered: true },
          { cssVar: '--solar-neutral-300', label: '300' },
          { cssVar: '--solar-neutral-400', label: '400' },
          { cssVar: '--solar-neutral-500', label: '500' },
          { cssVar: '--solar-neutral-600', label: '600' },
          { cssVar: '--solar-neutral-700', label: '700' },
          { cssVar: '--solar-neutral-800', label: '800' },
          { cssVar: '--solar-neutral-900', label: '900' },
        ]}
      />

      {/* Primitive: Red */}
      <ColorGroup
        title="Red (Primitives)"
        swatches={[
          { cssVar: '--solar-red-50', label: '50', bordered: true },
          { cssVar: '--solar-red-100', label: '100' },
          { cssVar: '--solar-red-200', label: '200' },
          { cssVar: '--solar-red-300', label: '300' },
          { cssVar: '--solar-red-400', label: '400' },
          { cssVar: '--solar-red-500', label: '500' },
          { cssVar: '--solar-red-600', label: '600' },
          { cssVar: '--solar-red-700', label: '700' },
        ]}
      />

      {/* Primitive: Orange */}
      <ColorGroup
        title="Orange (Primitives)"
        swatches={[
          { cssVar: '--solar-orange-50', label: '50', bordered: true },
          { cssVar: '--solar-orange-100', label: '100' },
          { cssVar: '--solar-orange-200', label: '200' },
          { cssVar: '--solar-orange-300', label: '300' },
          { cssVar: '--solar-orange-400', label: '400' },
          { cssVar: '--solar-orange-500', label: '500' },
          { cssVar: '--solar-orange-600', label: '600' },
          { cssVar: '--solar-orange-700', label: '700' },
        ]}
      />

      {/* Primitive: Green */}
      <ColorGroup
        title="Green (Primitives)"
        swatches={[
          { cssVar: '--solar-green-50', label: '50', bordered: true },
          { cssVar: '--solar-green-100', label: '100' },
          { cssVar: '--solar-green-200', label: '200' },
          { cssVar: '--solar-green-300', label: '300' },
          { cssVar: '--solar-green-400', label: '400' },
          { cssVar: '--solar-green-500', label: '500' },
          { cssVar: '--solar-green-600', label: '600' },
          { cssVar: '--solar-green-700', label: '700' },
        ]}
      />

      {/* Primitive: Blue */}
      <ColorGroup
        title="Blue (Primitives)"
        swatches={[
          { cssVar: '--solar-blue-50', label: '50', bordered: true },
          { cssVar: '--solar-blue-100', label: '100' },
          { cssVar: '--solar-blue-200', label: '200' },
          { cssVar: '--solar-blue-300', label: '300' },
          { cssVar: '--solar-blue-400', label: '400' },
          { cssVar: '--solar-blue-500', label: '500' },
          { cssVar: '--solar-blue-600', label: '600' },
          { cssVar: '--solar-blue-700', label: '700' },
        ]}
      />

      {/* Common */}
      <ColorGroup
        title="Common"
        swatches={[
          { cssVar: '--solar-black', label: 'black' },
          { cssVar: '--solar-white', label: 'white', bordered: true },
        ]}
      />

      {/* Icon */}
      <ColorGroup
        title="Icon"
        swatches={[
          { cssVar: '--solar-icon-default', label: 'default' },
          { cssVar: '--solar-icon-secondary', label: 'secondary' },
          { cssVar: '--solar-icon-tertiary', label: 'tertiary' },
          { cssVar: '--solar-icon-disabled', label: 'disabled' },
          { cssVar: '--solar-icon-inverse', label: 'inverse', bordered: true },
          { cssVar: '--solar-icon-brand', label: 'brand' },
          { cssVar: '--solar-icon-danger', label: 'danger' },
        ]}
      />
    </div>
  ),
};
