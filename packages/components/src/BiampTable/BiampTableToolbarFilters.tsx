import { CloseIcon, FilterIcon } from '@bwp-web/assets';
import { type ReactNode, useCallback, useEffect, useId, useState } from 'react';
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
}: BiampTableToolbarFiltersProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const handleClose = useCallback(() => {
    onApply?.();
    setOpen(false);
  }, [onApply]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <>
      <BiampTableToolbarActionButton
        label={buttonLabel}
        icon={icon}
        badgeContent={activeFilterCount}
        onClick={() => setOpen(true)}
      />

      {/* Backdrop + Drawer */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onClick={handleClose}
          />

          {/* Slide-in panel */}
          <div
            role="dialog"
            aria-labelledby={titleId}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'var(--solar-surface-default, #fff)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
              animation: 'biamp-drawer-slide-in 225ms ease-out',
            }}
          >
            <style>{`@keyframes biamp-drawer-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            {/* Header */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 28px',
                }}
              >
                <h2
                  id={titleId}
                  style={{
                    margin: 0,
                    fontSize: 'var(--solar-font-size-h2, 1.25rem)',
                    fontWeight: 'var(--solar-font-weight-h2, 600)',
                    color: 'var(--solar-text-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {title}
                  {activeFilterCount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 20,
                        height: 20,
                        borderRadius: 10,
                        padding: '0 6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--solar-status-info, #9c27b0)',
                        color: '#fff',
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={closeLabel}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    color: 'inherit',
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
              <hr
                style={{
                  margin: 0,
                  border: 'none',
                  borderTop: '1px solid var(--solar-border-default)',
                }}
              />

              {/* Body */}
              <div
                role="group"
                aria-label="Filter options"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  padding: 28,
                  overflow: 'auto',
                }}
              >
                {children}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex' }}>
              <button
                type="button"
                onClick={onReset}
                disabled={activeFilterCount === 0}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  cursor: activeFilterCount === 0 ? 'default' : 'pointer',
                  opacity: activeFilterCount === 0 ? 0.5 : 1,
                  backgroundColor: 'var(--solar-surface-secondary, #e0e0e0)',
                  color: 'var(--solar-text-default)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {resetLabel}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--solar-action-primary, #1976d2)',
                  color: 'var(--solar-text-inverse, #fff)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {applyLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
