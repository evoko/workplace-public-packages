import oracle from '../../../../../spec/verify/fileupload.json';
import { FileUpload, type FileUploadProps } from '../../../src/FileUpload.js';
import type { VisualCase } from './types.js';

// Figma's words: its label, its limits, and its file's name where it is filled (the oracle's
// content), its placeholder otherwise.
export default {
  oracle,
  render: (v) => (
    <FileUpload
      {...(v.props as Pick<FileUploadProps, 'disabled' | 'error'>)}
      label="Upload a file"
      mandatory
      helper="Max 10MB, .jpg .png"
      value={
        v.content?.includes('value') ? [new File([''], 'Filename.jpg')] : []
      }
      onChange={() => {}}
    />
  ),
} satisfies VisualCase;
