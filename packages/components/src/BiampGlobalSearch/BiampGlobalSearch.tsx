import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { KeyArrowDownIcon, KeyArrowUpIcon, SearchIcon } from '@bwp-web/assets';
import { cn } from '@bwp-web/styles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiampGlobalSearchOption {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  associatedItems?: { label: string }[];
  endIcon?: React.ReactNode;
  onClick?: () => void;
}

export interface BiampGlobalSearchProps {
  options?: BiampGlobalSearchOption[];
  placeholder?: string;
  noResultsText?: string;
  inputValue?: string;
  loading?: boolean;
  clearOnSelect?: boolean;
  open?: boolean;
  groupBy?: (option: BiampGlobalSearchOption) => string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (
    event: React.SyntheticEvent,
    value: BiampGlobalSearchOption | string | null,
    reason: string,
  ) => void;
  onInputChange?: (
    event: React.SyntheticEvent | null,
    value: string,
    reason: string,
  ) => void;
  onOpen?: (event: React.SyntheticEvent) => void;
  onClose?: (event: React.SyntheticEvent, reason: string) => void;
}

// ---------------------------------------------------------------------------
// SearchContext
// ---------------------------------------------------------------------------

const SearchContext = createContext<{
  hasOptions: boolean;
  loading: boolean;
  noResultsText: string;
  query: string;
}>({
  hasOptions: true,
  loading: false,
  noResultsText: 'No results found',
  query: '',
});

// ---------------------------------------------------------------------------
// KeyCap — keyboard key visual wrapper
// ---------------------------------------------------------------------------

function KeyCap({
  children,
  variant = 'icon',
}: {
  children: React.ReactNode;
  variant?: 'icon' | 'text';
}) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        padding: variant === 'text' ? '0 8px' : '0 4px',
        borderRadius: 'var(--solar-radius-sm)',
        backgroundColor: 'var(--solar-neutral-100)',
        color: 'var(--solar-neutral-400)',
        fontFamily: 'inherit',
        fontSize: '0.75rem',
        fontStyle: 'normal',
        fontWeight: 500,
        border: 'none',
      }}
    >
      <span style={{ display: 'contents' }}>{children}</span>
      <style>{`kbd > span > svg { width: 12px; height: 12px; }`}</style>
    </kbd>
  );
}

// ---------------------------------------------------------------------------
// DropdownFooter
// ---------------------------------------------------------------------------

function DropdownFooter() {
  const { hasOptions } = useContext(SearchContext);
  if (!hasOptions) return null;

  return (
    <div
      style={{
        borderTop: `0.6px solid var(--solar-border-default)`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <KeyCap>
            <KeyArrowDownIcon />
          </KeyCap>
          <KeyCap>
            <KeyArrowUpIcon />
          </KeyCap>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--solar-text-secondary)',
          }}
        >
          Select
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <KeyCap variant="text">Enter</KeyCap>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--solar-text-secondary)',
          }}
        >
          Open
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HighlightText
// ---------------------------------------------------------------------------

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span
        style={{
          backgroundColor: 'var(--solar-surface-info)',
          borderRadius: 'var(--solar-radius-sm)',
          color: 'var(--solar-text-info)',
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

function SearchChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--solar-surface-info)',
        borderRadius: 2,
        border: '1px solid var(--solar-border-default)',
        padding: '0 6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '24px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// BiampGlobalSearchListItem
// ---------------------------------------------------------------------------

function BiampGlobalSearchListItem({
  option,
  highlighted,
  onSelect,
  onMouseEnter,
}: {
  option: BiampGlobalSearchOption;
  highlighted: boolean;
  onSelect: (option: BiampGlobalSearchOption) => void;
  onMouseEnter: () => void;
}) {
  const { query } = useContext(SearchContext);
  const maxChips = 3;
  const chips = option.associatedItems?.slice(0, maxChips) ?? [];
  const overflow = (option.associatedItems?.length ?? 0) - maxChips;

  const showHoverContent = highlighted;

  return (
    <li
      role="option"
      aria-selected={highlighted}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 8,
        padding: '6px 16px',
        paddingRight: 0,
        cursor: 'pointer',
        backgroundColor: highlighted
          ? 'var(--solar-surface-secondary)'
          : 'transparent',
        listStyle: 'none',
      }}
      onClick={() => onSelect(option)}
      onMouseEnter={onMouseEnter}
    >
      {option.icon && (
        <div
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {option.icon}
        </div>
      )}

      <span
        style={{
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexShrink: 0,
        }}
      >
        <HighlightText text={option.title} query={query} />
      </span>

      {option.subtitle && (
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--solar-text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 1,
            minWidth: 0,
            display: showHoverContent ? 'block' : 'none',
          }}
        >
          {option.subtitle}
        </span>
      )}

      {chips.length > 0 && (
        <div
          style={{
            display: showHoverContent ? 'flex' : 'none',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
            flexShrink: 0,
            padding: '0 16px',
          }}
        >
          {chips.map((item, i) => (
            <SearchChip key={i} label={item.label} />
          ))}
          {overflow > 0 && <SearchChip label={`+${overflow}`} />}
        </div>
      )}

      {option.endIcon && (
        <div
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: chips.length > 0 ? 0 : 'auto',
            visibility: showHoverContent ? 'visible' : 'hidden',
          }}
        >
          {option.endIcon}
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// BiampGlobalSearch
// ---------------------------------------------------------------------------

export function BiampGlobalSearch({
  placeholder = 'Search...',
  noResultsText = 'No results found',
  options = [],
  inputValue: inputValueProp,
  loading = false,
  clearOnSelect = true,
  open: openProp,
  className,
  style,
  onChange,
  onInputChange,
  onOpen,
  onClose,
}: BiampGlobalSearchProps) {
  const hasOptions = options.length > 0;
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // The open state is controlled externally if openProp is provided
  const isOpen = openProp !== undefined ? openProp : internalOpen;

  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [options]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (openProp === undefined) {
          setInternalOpen(false);
        }
        onClose?.(event as unknown as React.SyntheticEvent, 'blur');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, openProp]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (option: BiampGlobalSearchOption) => {
      if (option.onClick) {
        option.onClick();
      }
      onChange?.(
        new Event('change') as unknown as React.SyntheticEvent,
        option,
        'selectOption',
      );

      if (clearOnSelect) {
        onInputChange?.(null, '', 'selectOption');
      }

      if (openProp === undefined) {
        setInternalOpen(false);
      }
      onClose?.(
        new Event('change') as unknown as React.SyntheticEvent,
        'selectOption',
      );
    },
    [onChange, onInputChange, clearOnSelect, openProp, onClose],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onInputChange?.(e, value, 'input');

      if (value && !isOpen) {
        if (openProp === undefined) {
          setInternalOpen(true);
        }
        onOpen?.(e);
      }
    },
    [onInputChange, isOpen, openProp, onOpen],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || options.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelect(options[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (openProp === undefined) {
            setInternalOpen(false);
          }
          onClose?.(e, 'escape');
          break;
      }
    },
    [isOpen, options, highlightedIndex, handleSelect, openProp, onClose],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (inputValueProp && !isOpen) {
        if (openProp === undefined) {
          setInternalOpen(true);
        }
        onOpen?.(e);
      }
    },
    [inputValueProp, isOpen, openProp, onOpen],
  );

  const showDropdown = isOpen && (hasOptions || loading || !hasOptions);

  return (
    <SearchContext.Provider
      value={{
        hasOptions,
        loading,
        noResultsText,
        query: inputValueProp ?? '',
      }}
    >
      <div
        ref={containerRef}
        className={cn(className)}
        style={{ position: 'relative', ...style }}
      >
        {/* Input wrapper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--solar-border-default)',
            borderRadius: 'var(--solar-radius-base)',
            backgroundColor: 'var(--solar-surface-default)',
            padding: '0 12px',
            height: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 8,
              color: 'var(--solar-icon-tertiary)',
            }}
          >
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            placeholder={placeholder}
            value={inputValueProp ?? ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              fontFamily: 'var(--solar-font-sans)',
              color: 'var(--solar-text-default)',
              padding: '8px 0',
              width: '100%',
            }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              marginTop: 4,
              backgroundColor: 'var(--solar-surface-default)',
              borderRadius: 'var(--solar-radius-base)',
              boxShadow: 'var(--solar-shadow-modal)',
              border: '1px solid var(--solar-border-default)',
              overflow: 'hidden',
            }}
          >
            {hasOptions || loading ? (
              <ul
                ref={listboxRef}
                role="listbox"
                style={{
                  margin: 0,
                  padding: '8px 0',
                  maxHeight: 300,
                  overflowY: 'auto',
                  listStyle: 'none',
                }}
              >
                {loading && options.length === 0 ? (
                  <li
                    style={{
                      padding: '6px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--solar-text-secondary)',
                    }}
                  >
                    Loading...
                  </li>
                ) : (
                  options.map((option, index) => (
                    <BiampGlobalSearchListItem
                      key={`${option.title}-${index}`}
                      option={option}
                      highlighted={index === highlightedIndex}
                      onSelect={handleSelect}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    />
                  ))
                )}
              </ul>
            ) : (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--solar-text-secondary)',
                  padding: '12px 16px',
                  margin: 0,
                }}
              >
                {noResultsText}
              </p>
            )}
            <DropdownFooter />
          </div>
        )}
      </div>
    </SearchContext.Provider>
  );
}
