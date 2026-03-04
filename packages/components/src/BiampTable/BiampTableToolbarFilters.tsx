import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  type DrawerProps,
  IconButton,
  Typography,
} from '@mui/material';
import { CloseIcon, FilterIcon } from '@bwp-web/assets';
import { type ReactNode, useState } from 'react';
import { BiampTableToolbarActionButton } from './BiampTableToolbarActionButton';

export type BiampTableToolbarFiltersProps = {
  /** Number of currently active filters. Shown as a badge on the trigger button. */
  activeFilterCount: number;
  /** Filter form content rendered inside the drawer body. */
  children: ReactNode;
  /** Called when the user clicks the reset / clear-all button. */
  onReset: () => void;
  /** Called when the drawer is closed (via close button, apply, or backdrop click). */
  onApply?: () => void;
  /** Icon for the toolbar trigger button. @default FilterIcon */
  icon?: ReactNode;
  /** Drawer heading. @default "Filters" */
  title?: string;
  /** Reset button label. @default "Clear filters" */
  resetLabel?: string;
  /** Apply button label. @default "Apply" */
  applyLabel?: string;
  /** Accessible label for the drawer close button. @default "Close" */
  closeLabel?: string;
  /** Accessible label for the toolbar trigger button. @default "Filters" */
  buttonLabel?: string;
  /** Additional props forwarded to the MUI Drawer. */
  DrawerProps?: Partial<DrawerProps>;
};

export function BiampTableToolbarFilters({
  activeFilterCount,
  children,
  onReset,
  onApply,
  icon = <FilterIcon variant="xs" />,
  title = 'Filters',
  resetLabel = 'Clear filters',
  applyLabel = 'Apply',
  closeLabel = 'Close',
  buttonLabel = 'Filters',
  DrawerProps: drawerProps,
}: BiampTableToolbarFiltersProps) {
  const [open, setOpen] = useState(false);

  function handleClose() {
    onApply?.();
    setOpen(false);
  }

  return (
    <>
      <BiampTableToolbarActionButton
        label={buttonLabel}
        icon={icon}
        badgeContent={activeFilterCount}
        onClick={() => setOpen(true)}
      />

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        {...drawerProps}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 480 } },
          ...drawerProps?.PaperProps,
        }}
      >
        <Box
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          {/* Header */}
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={3.5}
              py={2.5}
            >
              <Typography variant="h2">
                {title}
                <Badge
                  badgeContent={activeFilterCount}
                  color="secondary"
                  sx={{ ml: 1.5, mb: 0.5 }}
                />
              </Typography>
              <IconButton
                size="medium"
                onClick={handleClose}
                aria-label={closeLabel}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />

            {/* Body */}
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              p={3.5}
              overflow="auto"
            >
              {children}
            </Box>
          </Box>

          {/* Footer */}
          <Box display="flex">
            <Button
              variant="overlay"
              color="secondary"
              fullWidth
              onClick={onReset}
              disabled={activeFilterCount === 0}
            >
              {resetLabel}
            </Button>
            <Button
              variant="overlay"
              color="primary"
              fullWidth
              onClick={handleClose}
            >
              {applyLabel}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
