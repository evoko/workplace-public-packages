import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Dialog',
};

export default meta;
type Story = StoryObj;

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  backgroundColor: 'var(--solar-surface-default)',
  borderRadius: 'var(--solar-radius-lg)',
  boxShadow: 'var(--solar-shadow-modal)',
  padding: 0,
  minWidth: 360,
  maxWidth: 480,
  fontFamily: 'var(--solar-font-sans)',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  padding: '20px 24px 0',
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--solar-text-default)',
};

const contentStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '0.875rem',
  color: 'var(--solar-text-secondary)',
  lineHeight: 1.6,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '12px 24px 20px',
};

const btnBase: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderRadius: 'var(--solar-radius-base)',
  cursor: 'pointer',
  height: 40,
  padding: '0 16px',
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-primary-bg)',
  color: 'var(--solar-action-primary-text)',
  border: 'none',
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-primary-bg-danger)',
  color: 'var(--solar-action-primary-text-danger)',
  border: 'none',
};

const btnOutlined: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-secondary-bg)',
  color: 'var(--solar-action-secondary-text)',
  border: '1px solid var(--solar-border-secondary)',
};

const btnOutlinedDanger: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-secondary-bg-danger)',
  color: 'var(--solar-action-secondary-text-danger)',
  border: '1px solid var(--solar-border-danger)',
};

const triggerPrimary: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-primary-bg)',
  color: 'var(--solar-action-primary-text)',
  border: 'none',
};

const triggerDanger: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--solar-action-primary-bg-danger)',
  color: 'var(--solar-action-primary-text-danger)',
  border: 'none',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--solar-radius-base)',
  border: '1px solid var(--solar-border-default)',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-default)',
  backgroundColor: 'var(--solar-surface-default)',
  boxSizing: 'border-box',
};

function ConfirmationDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={heading}>Confirmation Dialog</h3>
      <div>
        <button style={triggerPrimary} onClick={() => setOpen(true)}>
          Open Dialog
        </button>
      </div>
      {open && (
        <div style={backdropStyle} onClick={() => setOpen(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={titleStyle}>Confirm Action</h2>
            <div style={contentStyle}>
              Are you sure you want to proceed with this action? This cannot be
              undone.
            </div>
            <div style={actionsStyle}>
              <button style={btnOutlined} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button style={btnPrimary} onClick={() => setOpen(false)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Confirmation: Story = {
  render: () => <ConfirmationDemo />,
};

function DeleteConfirmationDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={heading}>Delete Confirmation</h3>
      <div>
        <button style={triggerDanger} onClick={() => setOpen(true)}>
          Delete Item
        </button>
      </div>
      {open && (
        <div style={backdropStyle} onClick={() => setOpen(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={titleStyle}>Delete Item</h2>
            <div style={contentStyle}>
              This will permanently delete the selected item. This action cannot
              be undone.
            </div>
            <div style={actionsStyle}>
              <button style={btnOutlined} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button style={btnDanger} onClick={() => setOpen(false)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const DeleteConfirmation: Story = {
  render: () => <DeleteConfirmationDemo />,
};

function WithFormDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={heading}>Dialog with Form</h3>
      <div>
        <button style={triggerPrimary} onClick={() => setOpen(true)}>
          Create New
        </button>
      </div>
      {open && (
        <div style={backdropStyle} onClick={() => setOpen(false)}>
          <div
            style={{ ...dialogStyle, minWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={titleStyle}>Create New Item</h2>
            <div style={contentStyle}>
              <p style={{ margin: '0 0 16px' }}>
                Fill in the details below to create a new item.
              </p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--solar-text-default)',
                      marginBottom: 4,
                    }}
                  >
                    Name
                  </label>
                  <input style={inputStyle} placeholder="Enter name" />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--solar-text-default)',
                      marginBottom: 4,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
            <div style={actionsStyle}>
              <button style={btnOutlined} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button style={btnPrimary} onClick={() => setOpen(false)}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const WithForm: Story = {
  render: () => <WithFormDemo />,
};

function ThreeButtonActionsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={heading}>Three-button Dialog</h3>
      <p
        style={{
          fontFamily: 'var(--solar-font-sans)',
          fontSize: '0.875rem',
          color: 'var(--solar-text-secondary)',
          margin: 0,
        }}
      >
        The first button is pushed to the left when there are 3+ action buttons.
      </p>
      <div>
        <button style={triggerPrimary} onClick={() => setOpen(true)}>
          Open Dialog
        </button>
      </div>
      {open && (
        <div style={backdropStyle} onClick={() => setOpen(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={titleStyle}>Review Changes</h2>
            <div style={contentStyle}>
              You have unsaved changes. What would you like to do?
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '12px 24px 20px',
              }}
            >
              <button
                style={{ ...btnOutlinedDanger, marginRight: 'auto' }}
                onClick={() => setOpen(false)}
              >
                Discard
              </button>
              <button style={btnOutlined} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button style={btnPrimary} onClick={() => setOpen(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ThreeButtonActions: Story = {
  render: () => <ThreeButtonActionsDemo />,
};
