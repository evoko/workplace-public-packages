import { CloseIcon, SearchIcon } from '@bwp-web/assets';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BIAMP_TABLE_DEBOUNCE_DELAY,
  useDebouncedCallback,
} from './useDebouncedCallback';

type ExpandableSearchProps =
  | {
      /** When true, the search field collapses to an icon button when empty and unfocused. */
      expandable: true;
      /** Accessible label for the collapsed icon button. @default placeholder */
      expandLabel?: string;
    }
  | {
      expandable?: false;
      expandLabel?: never;
    };

export type BiampTableToolbarSearchProps = {
  /** Called with the debounced search string whenever the value changes. */
  onChange: (value: string) => void;
  /** Initial value for the search field. When this prop changes the input resets. */
  defaultValue?: string;
  /** Debounce delay in milliseconds. @default BIAMP_TABLE_DEBOUNCE_DELAY (300) */
  debounceDelay?: number;
  /** Maximum character length for the input. @default 120 */
  maxLength?: number;
  /** Maximum width of the text field. @default 280 */
  maxWidth?: number;
  /** Placeholder text. @default "Search" */
  placeholder?: string;
  /** Accessible label for the clear button. @default "Clear search" */
  clearLabel?: string;
  /** When true, renders a simplified full-width input on narrow screens. @default true */
  enableMobileView?: boolean;
  className?: string;
  style?: React.CSSProperties;
} & ExpandableSearchProps;

/** Simple hook to match a media query */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

const inputBaseStyle: React.CSSProperties = {
  height: 36,
  minHeight: 36,
  padding: '4px 8px 4px 12px',
  border: '1px solid var(--solar-border-default)',
  borderRadius: 4,
  background: 'var(--solar-surface-default, transparent)',
  color: 'var(--solar-text-default)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export function BiampTableToolbarSearch({
  onChange,
  defaultValue = '',
  debounceDelay = BIAMP_TABLE_DEBOUNCE_DELAY,
  maxLength = 120,
  maxWidth = 280,
  placeholder = 'Search',
  clearLabel = 'Clear search',
  expandable = false,
  expandLabel,
  enableMobileView = true,
  className,
  style,
}: BiampTableToolbarSearchProps) {
  // Below 900px is roughly MUI's "md" breakpoint
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedOnChange = useDebouncedCallback(onChange, debounceDelay);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      debouncedOnChange(e.target.value);
    },
    [debouncedOnChange],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    debouncedOnChange('');
  }, [debouncedOnChange]);

  const handleBlur = useCallback(() => {
    if (expandable && !inputValue) {
      setIsExpanded(false);
    }
  }, [expandable, inputValue]);

  const clearButton = inputValue ? (
    <button
      type="button"
      onClick={handleClear}
      aria-label={clearLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        marginRight: 4,
        color: 'inherit',
      }}
    >
      <CloseIcon variant="xs" style={{ width: 20, height: 20 }} />
    </button>
  ) : null;

  // Mobile view
  if (isMobile && enableMobileView) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          paddingRight: 8,
          gap: 8,
          ...style,
        }}
      >
        <SearchIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            name="search"
            type="text"
            placeholder={placeholder}
            maxLength={maxLength}
            aria-label="Search"
            value={inputValue}
            onChange={handleChange}
            style={{
              ...inputBaseStyle,
              border: 'none',
              paddingLeft: 8,
            }}
          />
          {clearButton && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {clearButton}
            </div>
          )}
        </div>
      </div>
    );
  }

  const textField = (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        maxWidth: expandable ? 170 : maxWidth,
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          pointerEvents: 'none',
        }}
      >
        <SearchIcon
          variant="xs"
          color="inherit"
          style={{ width: 16, height: 16 }}
        />
      </div>
      <input
        ref={inputRef}
        name="search"
        type="text"
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={placeholder}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus={expandable && isExpanded && !defaultValue ? true : undefined}
        style={{
          ...inputBaseStyle,
          paddingLeft: 32,
          paddingRight: clearButton ? 32 : 8,
        }}
      />
      {clearButton && (
        <div
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {clearButton}
        </div>
      )}
    </div>
  );

  if (expandable) {
    const showField = isExpanded || !!inputValue;
    return (
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 28 }}>
        <button
          type="button"
          aria-label={expandLabel ?? placeholder}
          onClick={() => {
            setIsExpanded(true);
            // Focus the input after it appears
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          style={{
            display: showField ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'inherit',
          }}
        >
          <SearchIcon
            variant="xs"
            color="inherit"
            style={{ width: 16, height: 16 }}
          />
        </button>
        <div
          style={{
            overflow: 'hidden',
            maxWidth: showField ? 300 : 0,
            opacity: showField ? 1 : 0,
            transition: 'max-width 300ms ease, opacity 300ms ease',
          }}
        >
          {textField}
        </div>
      </div>
    );
  }

  return textField;
}
