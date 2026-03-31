import { DownloadIcon } from '@bwp-web/assets';
import {
  BiampTableToolbarActionButton,
  type BiampTableToolbarActionButtonProps,
} from './BiampTableToolbarActionButton';

export type BiampTableToolbarExportProps = {
  /** Called when the export button is clicked. */
  onExport: () => void;
  /** When true, shows a spinner instead of the icon and disables the button. */
  loading?: boolean;
  /** Icon element for the button. @default DownloadIcon */
  icon?: React.ReactNode;
  /** Accessible label for the button. @default "Export" */
  label?: string;
} & Omit<
  BiampTableToolbarActionButtonProps,
  'icon' | 'label' | 'onClick' | 'badgeContent'
>;

/** Simple CSS spinner for loading state */
function CssSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ animation: 'biamp-spin 1s linear infinite' }}
    >
      <style>{`@keyframes biamp-spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={`${Math.PI * (size - 4) * 0.75} ${Math.PI * (size - 4) * 0.25}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BiampTableToolbarExport({
  onExport,
  loading,
  icon = <DownloadIcon variant="xs" />,
  label = 'Export',
  ...props
}: BiampTableToolbarExportProps) {
  return (
    <BiampTableToolbarActionButton
      label={loading ? `${label}, loading` : label}
      icon={loading ? <CssSpinner size={20} /> : icon}
      disabled={loading}
      onClick={onExport}
      {...props}
    />
  );
}
