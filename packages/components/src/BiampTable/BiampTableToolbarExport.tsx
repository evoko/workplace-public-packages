import { Button, type ButtonProps } from '@mui/material';
import { DownloadIcon } from '@bwp-web/assets';
import {
  BiampTableToolbarActionButton,
  type BiampTableToolbarActionButtonProps,
} from './BiampTableToolbarActionButton';

export type BiampTableToolbarExportProps = {
  /** Called when the export button is clicked. */
  onExport: () => void;
  /** When true, shows a loading spinner and disables the button. */
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
  icon = <DownloadIcon variant="xs" />,
  label = 'Export',
  ...props
}: BiampTableToolbarExportProps) {
  return (
    <BiampTableToolbarActionButton
      label={label}
      icon={icon}
      loading={loading}
      onClick={onExport}
      {...props}
    />
  );
}

export type BiampTableToolbarExportTextButtonProps = {
  /** Called when the export button is clicked. */
  onExport: () => void;
  /** When true, shows a loading spinner and disables the button. */
  loading?: boolean;
  /** Optional leading icon. No default — omit for a text-only button. */
  icon?: React.ReactNode;
  /** Button text. @default "Export" */
  label?: string;
} & Omit<ButtonProps, 'children' | 'onClick' | 'startIcon' | 'disabled'>;

export function BiampTableToolbarExportTextButton({
  onExport,
  loading,
  icon,
  label = 'Export',
  ...props
}: BiampTableToolbarExportTextButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={icon}
      loading={loading}
      onClick={onExport}
      {...props}
    >
      {label}
    </Button>
  );
}
