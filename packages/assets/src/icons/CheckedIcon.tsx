import { SvgIcon, SvgIconProps } from '@mui/material';

export function CheckedIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect width="16" height="16" rx="4" fill="currentColor" />
        <path
          d="M6.81561 9.47803C6.81717 9.47959 6.8197 9.47959 6.82126 9.47803L11.45 4.84926C11.7586 4.54071 12.2591 4.54159 12.5666 4.85123C12.8725 5.15933 12.8716 5.65682 12.5646 5.96384L6.82237 11.7061C6.8202 11.7082 6.81667 11.7082 6.8145 11.7061L3.43571 8.32728C3.1288 8.02037 3.1288 7.52277 3.43571 7.21587C3.74232 6.90926 4.23931 6.90891 4.54635 7.21509L6.81561 9.47803Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  );
}
