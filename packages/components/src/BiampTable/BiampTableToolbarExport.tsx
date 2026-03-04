import { CircularProgress } from '@mui/material';
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

export function BiampTableToolbarExport({
  onExport,
  loading,
  icon = <DownloadIcon />,
  label = 'Export',
  ...props
}: BiampTableToolbarExportProps) {
  return (
    <BiampTableToolbarActionButton
      label={label}
      icon={loading ? <CircularProgress size={20} color="inherit" /> : icon}
      disabled={loading}
      onClick={onExport}
      {...props}
    />
  );
}
