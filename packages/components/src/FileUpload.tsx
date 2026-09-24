/**
 * SOLAR FileUpload.
 *
 * Scaffolded once by `npm run solar:scaffold FileUpload` from spec/components/fileupload.json, and
 * owned by developers from then on: change it freely. What it looks like is not here. That is the
 * recipe, `solarFileUploadStyle` and `solarFileUploadCompose` in `@bwp-web/styles/mui`: the drop
 * zone's fill, edge and focus ring by state, its file's ink, and the label and helper.
 *
 * A file to upload: its `label` above (a `mandatory` one is starred), its `helper` below (the
 * limits: "Max 10MB, .jpg .png"), which says what is wrong where it is in `error`. Browse opens the
 * browser's file picker, a real `<input type="file">` of its `accept`, `multiple` and `name`, and
 * a file dropped on the zone is taken as well. Chosen, the file's name shows, with replace and
 * remove buttons. `onChange` is called with the files; `value` controls them. The app checks sizes
 * and types, and sets `error`. The app must load `@bwp-web/styles/tokens.css`.
 */

import { IconDelete, IconFile, IconRefresh } from '@bwp-web/assets';
import Box, { type BoxProps } from '@mui/material/Box';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, useRef, useState, type ReactNode } from 'react';
import {
  solarFileUploadCompose,
  solarFileUploadStyle,
  type SolarFileUploadProps,
} from '@bwp-web/styles/mui';
import { Button } from './Button.js';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['label', 'field', 'helper'],
  label: ['uploadAFile', 'mandatory'],
  field: ['iconFile', 'fileName', 'button', 'iconButton', 'iconButton2'],
};

export interface FileUploadProps
  extends
    SolarFileUploadProps,
    Omit<
      BoxProps,
      | keyof SolarFileUploadProps
      | 'children'
      | 'onChange'
      | 'defaultValue'
      | 'ref'
    > {
  /** What it asks for, above it ("Upload a file"). */
  label?: ReactNode;
  /** Whether a file is required, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below (the limits); where it is in `error`, what is wrong. */
  helper?: ReactNode;
  /** The files chosen; controlled where given. */
  value?: File[];
  /** The files it starts with, where `value` does not say. */
  defaultValue?: File[];
  /** Called with the files as they are chosen, dropped or removed. */
  onChange?: (files: File[]) => void;
  /** The types it takes, as the file input's `accept` (".jpg,.png", "image/*"). */
  accept?: string;
  /** Whether it takes more than one file. */
  multiple?: boolean;
  /** The file input's name, for a form. */
  name?: string;
  /** What the zone says while no file is chosen. */
  placeholder?: string;
  /** Browse's words. */
  browseLabel?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  function FileUpload(
    {
      error,
      disabled,
      label,
      mandatory = false,
      helper,
      value: valueProp,
      defaultValue,
      onChange,
      accept,
      multiple = false,
      name,
      placeholder = 'Select a file…',
      browseLabel = 'Browse',
      className,
      style,
      sx,
      ...rest
    },
    ref,
  ) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useControlled<File[]>({
      controlled: valueProp,
      default: defaultValue ?? [],
      name: 'FileUpload',
      state: 'value',
    });
    const [dragging, setDragging] = useState(false);
    const choose = (list: FileList | null) => {
      const chosen = Array.from(list ?? []).slice(0, multiple ? undefined : 1);
      if (!chosen.length) return;
      setFiles(chosen);
      onChange?.(chosen);
    };
    const browse = () => input.current?.click();
    const remove = () => {
      setFiles([]);
      onChange?.([]);
      if (input.current) input.current.value = '';
    };
    // Filled where it holds a file.
    const filled = files.length > 0;
    const look = { error, disabled, filled };
    // Its Browse gives way to replace and remove once filled, and is disabled with it.
    const parts = solarFileUploadCompose(
      look,
      disabled ? 'disabled' : filled ? 'filled' : error ? 'error' : 'default',
    );
    return (
      <Box
        ref={ref}
        {...rest}
        className={
          [
            dragging ? 'SolarFileUpload-dragging' : null,
            filled ? 'SolarFileUpload-filled' : null,
            error ? 'SolarFileUpload-error' : null,
            disabled ? 'SolarFileUpload-disabled' : null,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        style={style}
        sx={[solarFileUploadStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <input
          ref={input}
          id={id}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          name={name}
          required={mandatory}
          disabled={disabled}
          onChange={(event) => choose(event.target.files)}
        />
        {drawChildren('root', {
          prefix: 'SolarFileUpload',
          tree: TREE,
          // A part left empty is not drawn.
          parts: {
            ...parts,
            label: { ...parts.label, present: label != null },
            mandatory: { ...parts.mandatory, present: mandatory },
            helper: { ...parts.helper, present: helper != null },
          },
          text: {
            uploadAFile: label,
            mandatory: <span aria-hidden>*</span>,
            fileName: filled
              ? files.map((f) => f.name).join(', ')
              : placeholder,
            helper,
          },
          icons: { iconFile: <IconFile /> },
          render: {
            // The drop zone takes a file dropped on it, as Browse does.
            field: (layer) => (
              <span
                {...layer}
                onDragOver={(event) => {
                  if (disabled) return;
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (!disabled) choose(event.dataTransfer.files);
                }}
              />
            ),
            button: (layer) => (
              <span {...layer}>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={disabled}
                  onClick={browse}
                >
                  {browseLabel}
                </Button>
              </span>
            ),
            iconButton: (layer) => (
              <span {...layer}>
                <IconButton
                  variant="secondary"
                  size="md"
                  shape="square"
                  icon={<IconRefresh />}
                  aria-label="Replace file"
                  onClick={browse}
                />
              </span>
            ),
            iconButton2: (layer) => (
              <span {...layer}>
                <IconButton
                  variant="secondary"
                  size="md"
                  shape="square"
                  icon={<IconDelete />}
                  aria-label="Remove file"
                  onClick={remove}
                />
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
