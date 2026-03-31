import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Skeleton',
};

export default meta;
type Story = StoryObj;

const pulseKeyframes = `
@keyframes skeleton-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
`;

const skeletonBase: React.CSSProperties = {
  backgroundColor: 'var(--solar-neutral-200)',
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
};

const SkeletonText = ({ width = '100%' }: { width?: string | number }) => (
  <div
    style={{
      ...skeletonBase,
      height: 16,
      width,
      borderRadius: 'var(--solar-radius-sm)',
    }}
  />
);

const SkeletonCircle = ({ size = 40 }: { size?: number }) => (
  <div
    style={{
      ...skeletonBase,
      width: size,
      height: size,
      borderRadius: 'var(--solar-radius-full)',
    }}
  />
);

const SkeletonRect = ({
  width = 300,
  height = 60,
  rounded = false,
}: {
  width?: number;
  height?: number;
  rounded?: boolean;
}) => (
  <div
    style={{
      ...skeletonBase,
      width,
      height,
      borderRadius: rounded
        ? 'var(--solar-radius-base)'
        : 'var(--solar-radius-sm)',
    }}
  />
);

export const Variants: Story = {
  render: () => (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 300,
          fontFamily: 'var(--solar-font-sans)',
        }}
      >
        <h6
          style={{
            color: 'var(--solar-text-default)',
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          Skeleton variants
        </h6>
        <SkeletonText />
        <SkeletonCircle />
        <SkeletonRect width={300} height={60} />
        <SkeletonRect width={300} height={60} rounded />
      </div>
    </>
  ),
};

export const CardLoading: Story = {
  name: 'Card loading state',
  render: () => (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ display: 'flex', gap: 16 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 280,
              backgroundColor: 'var(--solar-surface-default)',
              border: '1px solid var(--solar-border-default)',
              borderRadius: 'var(--solar-radius-lg)',
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <SkeletonText width="40%" />
              <SkeletonText width="80%" />
              <SkeletonRect width={248} height={120} />
              <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                <SkeletonRect width={80} height={36} rounded />
                <SkeletonRect width={80} height={36} rounded />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  ),
};
