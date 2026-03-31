import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Button',
};

export default meta;
type Story = StoryObj;

const base: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: 1,
  borderRadius: 'var(--solar-radius-base)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  border: 'none',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
};

const sizes: Record<string, React.CSSProperties> = {
  small: { height: 36, padding: '0 12px' },
  medium: { height: 44, padding: '0 16px' },
  large: { height: 48, padding: '0 20px' },
};

function btn(
  variant: 'primary' | 'secondary' | 'tertiary',
  color: 'default' | 'danger' = 'default',
  size: 'small' | 'medium' | 'large' = 'medium',
  disabled = false,
): React.CSSProperties {
  let bg: string;
  let fg: string;
  let border: string;

  if (variant === 'primary' && color === 'default') {
    bg = disabled
      ? 'var(--solar-action-primary-bg-disabled)'
      : 'var(--solar-action-primary-bg)';
    fg = disabled
      ? 'var(--solar-action-primary-text-disabled)'
      : 'var(--solar-action-primary-text)';
    border = 'transparent';
  } else if (variant === 'primary' && color === 'danger') {
    bg = disabled
      ? 'var(--solar-action-primary-bg-danger-disabled)'
      : 'var(--solar-action-primary-bg-danger)';
    fg = disabled
      ? 'var(--solar-action-primary-text-disabled)'
      : 'var(--solar-action-primary-text-danger)';
    border = 'transparent';
  } else if (variant === 'secondary' && color === 'default') {
    bg = disabled
      ? 'var(--solar-action-secondary-bg-disabled)'
      : 'var(--solar-action-secondary-bg)';
    fg = disabled
      ? 'var(--solar-action-secondary-text-disabled)'
      : 'var(--solar-action-secondary-text)';
    border = disabled
      ? 'var(--solar-border-default)'
      : 'var(--solar-border-secondary)';
  } else if (variant === 'secondary' && color === 'danger') {
    bg = disabled
      ? 'var(--solar-action-secondary-bg-danger-disabled)'
      : 'var(--solar-action-secondary-bg-danger)';
    fg = disabled
      ? 'var(--solar-action-secondary-text-disabled)'
      : 'var(--solar-action-secondary-text-danger)';
    border = disabled
      ? 'var(--solar-border-default)'
      : 'var(--solar-border-danger)';
  } else if (variant === 'tertiary' && color === 'danger') {
    bg = 'transparent';
    fg = disabled
      ? 'var(--solar-action-secondary-text-disabled)'
      : 'var(--solar-text-danger)';
    border = 'transparent';
  } else {
    // tertiary default
    bg = 'transparent';
    fg = disabled
      ? 'var(--solar-action-secondary-text-disabled)'
      : 'var(--solar-action-secondary-text)';
    border = 'transparent';
  }

  return {
    ...base,
    ...sizes[size],
    backgroundColor: bg,
    color: fg,
    border: border === 'transparent' ? 'none' : `1px solid ${border}`,
    opacity: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const row: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
};

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

/**
 * Maps SOLAR priority:
 * - Primary = filled background, white text
 * - Secondary = border, transparent background
 * - Tertiary = no border, no background
 *
 * Each priority supports a danger mode.
 */
export const AllPriorities: Story = {
  name: 'All Priorities',
  render: () => {
    const priorities = [
      { label: 'Primary', variant: 'primary' as const },
      { label: 'Secondary', variant: 'secondary' as const },
      { label: 'Tertiary', variant: 'tertiary' as const },
    ];

    return (
      <div style={col}>
        {priorities.map(({ label, variant }) => (
          <div key={label} style={col}>
            <h6 style={heading}>{label}</h6>
            <div style={row}>
              <button style={btn(variant, 'default')}>Default</button>
              <button style={btn(variant, 'danger')}>Danger</button>
              <button style={btn(variant, 'default', 'medium', true)} disabled>
                Disabled
              </button>
              <button style={btn(variant, 'danger', 'medium', true)} disabled>
                Danger Disabled
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Three sizes: sm (36px), md (44px), lg (48px).
 */
export const Sizes: Story = {
  render: () => {
    const szList = [
      { label: 'Small (sm)', size: 'small' as const },
      { label: 'Medium (md)', size: 'medium' as const },
      { label: 'Large (lg)', size: 'large' as const },
    ];

    return (
      <div style={col}>
        {szList.map(({ label, size }) => (
          <div key={label} style={col}>
            <h6 style={heading}>{label}</h6>
            <div style={row}>
              <button style={btn('primary', 'default', size)}>Primary</button>
              <button style={btn('secondary', 'default', size)}>
                Secondary
              </button>
              <button style={btn('tertiary', 'default', size)}>Tertiary</button>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Danger mode for destructive, irreversible actions.
 */
export const DangerButtons: Story = {
  name: 'Danger',
  render: () => (
    <div style={col}>
      <h6 style={heading}>Danger variants</h6>
      <div style={row}>
        <button style={btn('primary', 'danger')}>Delete project</button>
        <button style={btn('secondary', 'danger')}>Remove access</button>
        <button style={btn('tertiary', 'danger')}>Revoke</button>
      </div>
      <div style={row}>
        <button style={btn('primary', 'danger', 'medium', true)} disabled>
          Delete project
        </button>
        <button style={btn('secondary', 'danger', 'medium', true)} disabled>
          Remove access
        </button>
        <button style={btn('tertiary', 'danger', 'medium', true)} disabled>
          Revoke
        </button>
      </div>
    </div>
  ),
};

/**
 * Full matrix: every variant x color x size x disabled state.
 */
export const FullMatrix: Story = {
  name: 'Full Matrix',
  render: () => {
    const variants = ['primary', 'secondary', 'tertiary'] as const;
    const colors = ['default', 'danger'] as const;
    const szList = ['small', 'medium', 'large'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {szList.map((size) => (
          <div key={size} style={col}>
            <h6 style={heading}>Size: {size}</h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {variants.map((variant) => (
                <div key={variant} style={{ ...row, gap: 12 }}>
                  <span
                    style={{
                      width: 80,
                      flexShrink: 0,
                      fontFamily: 'var(--solar-font-sans)',
                      fontSize: '0.75rem',
                      color: 'var(--solar-text-secondary)',
                    }}
                  >
                    {variant}
                  </span>
                  {colors.map((color) => (
                    <Fragment key={color}>
                      <button style={btn(variant, color, size)}>{color}</button>
                      <button style={btn(variant, color, size, true)} disabled>
                        {color} disabled
                      </button>
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
