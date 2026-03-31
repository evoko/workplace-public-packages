import type { Meta, StoryObj } from '@storybook/react-vite';
import { BiampWrapper } from '@bwp-web/components';

const meta: Meta<typeof BiampWrapper> = {
  title: 'Components/BiampWrapper',
  component: BiampWrapper,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'grey',
      values: [{ name: 'grey', value: '#F5F5F5' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BiampWrapper>;

/**
 * The default BiampWrapper with simple content. The wrapper provides
 * a full-height container with 16px padding, 8px border radius, and
 * a white background (dark: `grey.800`). The outer page background
 * is `grey.100` (dark: `grey.800`).
 */
export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BiampWrapper>
        <div>
          <h4 style={{ margin: '0 0 8px' }}>Page Content</h4>
          <p style={{ margin: 0 }}>
            This is an example of content inside the BiampWrapper. The wrapper
            provides a full-height container with 16px padding, a white
            background with 8px rounded corners, and scrollable overflow.
          </p>
        </div>
      </BiampWrapper>
    </div>
  ),
};

/**
 * The wrapper with card-based content, demonstrating how it provides
 * a content area for dashboard-style layouts.
 */
export const WithCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BiampWrapper>
        <div style={{ padding: 24 }}>
          <h4 style={{ margin: '0 0 8px' }}>Dashboard</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Devices', 'Rooms', 'Users'].map((title) => (
              <div
                key={title}
                style={{
                  flex: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  padding: 16,
                }}
              >
                <h6 style={{ margin: '0 0 4px' }}>{title}</h6>
                <p
                  style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}
                >
                  Manage your {title.toLowerCase()} here.
                </p>
              </div>
            ))}
          </div>
        </div>
      </BiampWrapper>
    </div>
  ),
};

/**
 * The wrapper at a mobile viewport size.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BiampWrapper>
        <div style={{ padding: 16 }}>
          <h5 style={{ margin: '0 0 8px' }}>Mobile View</h5>
          <p style={{ margin: 0, fontSize: 14 }}>
            The wrapper uses 16px padding around the content area at all
            breakpoints.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginTop: 16,
            }}
          >
            {['Devices', 'Rooms', 'Users'].map((title) => (
              <div
                key={title}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  padding: 16,
                }}
              >
                <h6 style={{ margin: '0 0 4px' }}>{title}</h6>
                <p
                  style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}
                >
                  Manage your {title.toLowerCase()} here.
                </p>
              </div>
            ))}
          </div>
        </div>
      </BiampWrapper>
    </div>
  ),
};

/**
 * An empty wrapper showing the rounded white container against
 * the `grey.100` (dark: `grey.800`) page background.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <BiampWrapper />
    </div>
  ),
};

/**
 * Multiple BiampWrappers stacked vertically, demonstrating
 * how they share space when placed in a Stack container.
 */
export const MultipleSideBySide: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        gap: 16,
      }}
    >
      <BiampWrapper>
        <div>
          <h5 style={{ margin: '0 0 8px' }}>First Wrapper</h5>
          <p style={{ margin: 0, fontSize: 14 }}>
            This wrapper stretches to fill available space. With flex: 1
            built-in, it shares space equally with other wrappers in the
            container.
          </p>
        </div>
      </BiampWrapper>
      <BiampWrapper>
        <div>
          <h5 style={{ margin: '0 0 8px' }}>Second Wrapper</h5>
          <p style={{ margin: 0, fontSize: 14 }}>
            Each wrapper automatically fills its share of the available height
            within the parent Stack, creating equal-sized sections.
          </p>
        </div>
      </BiampWrapper>
    </div>
  ),
};

/**
 * Multiple BiampWrappers stacked vertically, demonstrating
 * how they share space when placed in a Stack container.
 */
export const FourSideBySide: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flex: 1 }}>
        <BiampWrapper>
          <div>
            <h5 style={{ margin: '0 0 8px' }}>First Wrapper</h5>
            <p style={{ margin: 0, fontSize: 14 }}>
              This wrapper stretches to fill available space. With flex: 1
              built-in, it shares space equally with other wrappers in the
              container.
            </p>
          </div>
        </BiampWrapper>
        <BiampWrapper>
          <div>
            <h5 style={{ margin: '0 0 8px' }}>Second Wrapper</h5>
            <p style={{ margin: 0, fontSize: 14 }}>
              Each wrapper automatically fills its share of the available height
              within the parent Stack, creating equal-sized sections.
            </p>
          </div>
        </BiampWrapper>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flex: 1 }}>
        <BiampWrapper>
          <div>
            <h5 style={{ margin: '0 0 8px' }}>Third Wrapper</h5>
            <p style={{ margin: 0, fontSize: 14 }}></p>
          </div>
        </BiampWrapper>
        <BiampWrapper>
          <div>
            <h5 style={{ margin: '0 0 8px' }}>Fourth Wrapper</h5>
            <p style={{ margin: 0, fontSize: 14 }}></p>
          </div>
        </BiampWrapper>
      </div>
    </div>
  ),
};
