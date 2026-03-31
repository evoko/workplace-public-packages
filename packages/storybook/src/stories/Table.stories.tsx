import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Table',
};

export default meta;
type Story = StoryObj;

const rows = [
  { id: 1, name: 'Conference Room A', status: 'Available', capacity: 12 },
  { id: 2, name: 'Conference Room B', status: 'Occupied', capacity: 8 },
  { id: 3, name: 'Meeting Room 1', status: 'Available', capacity: 4 },
  { id: 4, name: 'Meeting Room 2', status: 'Maintenance', capacity: 6 },
  { id: 5, name: 'Board Room', status: 'Available', capacity: 20 },
];

const tableWrap: React.CSSProperties = {
  border: '1px solid var(--solar-border-default)',
  borderRadius: 'var(--solar-radius-base)',
  overflow: 'hidden',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-default)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'var(--solar-text-secondary)',
  backgroundColor: 'var(--solar-surface-secondary)',
  borderBottom: '1px solid var(--solar-border-default)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--solar-border-default)',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Table</h3>
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Room Name</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={tdStyle}>{row.name}</td>
                <td style={tdStyle}>{row.status}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {row.capacity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Table with Selection</h3>
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 48, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--solar-brand-600)' }}
                />
              </th>
              <th style={thStyle}>Room Name</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                style={
                  index === 1
                    ? {
                        backgroundColor: 'var(--solar-surface-brand-subtle)',
                      }
                    : undefined
                }
              >
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    defaultChecked={index === 1}
                    style={{ accentColor: 'var(--solar-brand-600)' }}
                  />
                </td>
                <td style={tdStyle}>{row.name}</td>
                <td style={tdStyle}>{row.status}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {row.capacity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
