import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/IconButton',
};

export default meta;
type Story = StoryObj;

const iconBtn = (
  size: 'small' | 'medium' | 'large' = 'medium',
  color: 'default' | 'primary' | 'error' = 'default',
  disabled = false,
): React.CSSProperties => {
  const dim = size === 'small' ? 32 : size === 'large' ? 44 : 38;
  const fontSize =
    size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.25rem';

  let fg: string;
  if (disabled) {
    fg = 'var(--solar-icon-disabled)';
  } else if (color === 'primary') {
    fg = 'var(--solar-icon-brand)';
  } else if (color === 'error') {
    fg = 'var(--solar-icon-danger)';
  } else {
    fg = 'var(--solar-icon-default)';
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dim,
    height: dim,
    borderRadius: 'var(--solar-radius-base)',
    border: 'none',
    background: 'none',
    color: fg,
    fontSize,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--solar-font-sans)',
  };
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const icons = ['\u270E', '\u2716', '\u2699', '\u2715', '\u22EE'];
const iconLabels = ['Edit', 'Delete', 'Settings', 'Close', 'More'];

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size}>
          <h6 style={{ ...heading, marginBottom: 12 }}>Size: {size}</h6>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {icons.map((icon, i) => (
              <button key={i} style={iconBtn(size)} title={iconLabels[i]}>
                {icon}
              </button>
            ))}
            <button
              style={iconBtn(size, 'default', true)}
              disabled
              title="Disabled"
            >
              {icons[0]}
            </button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {[
        { color: 'default' as const, label: 'Default' },
        { color: 'primary' as const, label: 'Primary' },
        { color: 'error' as const, label: 'Error' },
      ].map(({ color, label }) => (
        <div key={color}>
          <h6 style={{ ...heading, marginBottom: 12 }}>{label}</h6>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {icons.slice(0, 3).map((icon, i) => (
              <button
                key={i}
                style={iconBtn('medium', color)}
                title={iconLabels[i]}
              >
                {icon}
              </button>
            ))}
            <button
              style={iconBtn('medium', color, true)}
              disabled
              title="Disabled"
            >
              {icons[0]}
            </button>
          </div>
        </div>
      ))}
    </div>
  ),
};
