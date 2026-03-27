import {
  CheckedIcon,
  ErrorStatusIcon,
  IndeterminateIcon,
  InfoStatusIcon,
  InterRegular,
  InterMedium,
  InterSemiBold,
  InterBold,
  RadioCheckedIcon,
  RadioUncheckedIcon,
  SuccessStatusIcon,
  UncheckedIcon,
  WarningStatusIcon,
  CloseIcon,
  ChevronRightIcon,
  CalendarIcon,
  ChevronFullLeftIcon,
  ChevronFullRightIcon,
  ChevronLeftIcon,
  ClockTimeIcon,
  DropdownChevronDuoIcon,
} from '@bwp-web/assets';
import { alpha, createTheme, type Theme } from '@mui/material/styles';
import { CustomCalendarHeader } from './custom-components/CustomCalendarHeader';
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers';
// Import MUI X theme augmentation to enable DatePicker/TimePicker component overrides
import '@mui/x-date-pickers/themeAugmentation';

const colors = {
  black: '#000000',
  white: '#ffffff',
  grey: {
    50: '#f5f5f5',
    100: '#e0e0e0',
    200: '#c9c9c9',
    300: '#a8a8a8',
    400: '#8c8c8c',
    500: '#646464',
    600: '#484848',
    700: '#333333',
    800: '#222222',
    900: '#111111',
  },
  blue: {
    main: '#2569fd',
    hover: '#1450d4',
    dark: '#2658d5',
  },
  purple: {
    main: '#7b3aff',
    dark: '#6226d1',
    light: '#8e4bff',
  },
  green: {
    main: '#009600',
    dark: '#24791d',
  },
  orange: {
    main: '#cf4700',
    dark: '#b33200',
  },
  yellow: {
    main: '#ecb600',
    dark: '#c39900',
  },
  turquoise: {
    main: '#08b8c9',
    dark: '#0896a6',
  },
  red: {
    main: '#e0032d',
    dark: '#c00024',
  },
  biamp: '#d22730',
  sidebar: '#E0E0E0',
  action: {
    disabled: '#11111166',
    disabledBackground: '#E0E0E0',
  },
  success: {
    dark: {
      main: '#009600',
      background: '#002400',
    },
    light: {
      main: '#009600',
      background: '#ecffe9',
    },
  },
  warning: {
    dark: {
      main: '#c39900',
      background: '#3a2600',
    },
    light: {
      main: '#cf4700',
      background: '#ffeeda',
    },
  },
  error: {
    dark: {
      main: '#c00024',
      background: '#410001',
    },
    light: {
      main: '#e0032d',
      background: '#ffe4df',
    },
  },
  info: {
    dark: {
      main: '#0896a6',
      background: '#002b30',
    },
    light: {
      main: '#08b8c9',
      background: '#f0ffff',
    },
  },
} as const;

export const appBarHeight = 64;

const drawerWidth = 300;

export const biampTheme = (
  overrideOptions: Parameters<typeof createTheme>[0] = {},
) =>
  createTheme(
    {
      spacing: 8,
      shape: { borderRadius: 4 },
      cssVariables: {
        colorSchemeSelector: 'class',
      },
      colorSchemes: {
        light: {
          palette: {
            secondary: {
              contrastText: colors.grey[900],
              dark: colors.white,
              light: colors.white,
              main: colors.white,
            },
            success: {
              contrastText: colors.white,
              dark: colors.success.light.main,
              light: colors.success.light.main,
              main: colors.success.light.main,
            },
            warning: {
              contrastText: colors.white,
              dark: colors.warning.light.main,
              light: colors.warning.light.main,
              main: colors.warning.light.main,
            },
            error: {
              contrastText: colors.white,
              dark: colors.error.light.main,
              light: colors.error.light.main,
              main: colors.error.light.main,
            },
            info: {
              contrastText: colors.white,
              dark: colors.turquoise.dark,
              light: colors.turquoise.main,
              main: colors.turquoise.main,
            },
            grey: {
              ...colors.grey,
            },
            common: {
              black: colors.black,
              white: colors.white,
            },
            biamp: {
              contrastText: colors.white,
              dark: colors.biamp,
              light: colors.biamp,
              main: colors.biamp,
            },
            purple: {
              contrastText: colors.white,
              dark: colors.purple.dark,
              light: colors.purple.light,
              main: colors.purple.main,
            },
            blue: {
              contrastText: colors.white,
              dark: colors.blue.dark,
              light: colors.blue.hover,
              main: colors.blue.main,
            },
            sidebar: {
              contrastText: colors.white,
              dark: colors.sidebar,
              light: colors.sidebar,
              main: colors.sidebar,
            },
            primary: {
              contrastText: colors.white,
              dark: colors.grey[900],
              light: colors.grey[900],
              main: colors.grey[900],
            },
            text: {
              primary: colors.grey[900],
              secondary: colors.grey[500],
              disabled: alpha(colors.grey[900], 0.4),
              sidebar: colors.sidebar,
            },
            background: {
              default: colors.grey[50],
              paper: colors.white,
              success: colors.success.light.background,
              warning: colors.warning.light.background,
              error: colors.error.light.background,
              info: colors.info.light.background,
            },
            action: {
              disabled: colors.action.disabled,
              disabledBackground: colors.action.disabledBackground,
            },
            divider: alpha(colors.grey[900], 0.15),
            dividers: {
              primary: alpha(colors.grey[900], 0.15),
              secondary: alpha(colors.grey[900], 0.4),
            },
          },
        },
        dark: {
          palette: {
            secondary: {
              contrastText: colors.grey[900],
              dark: colors.white,
              light: colors.white,
              main: colors.white,
            },
            success: {
              contrastText: colors.grey[900],
              light: colors.success.dark.main,
              dark: colors.success.dark.main,
              main: colors.success.dark.main,
            },
            warning: {
              contrastText: colors.grey[900],
              light: colors.warning.dark.main,
              dark: colors.warning.dark.main,
              main: colors.warning.dark.main,
            },
            error: {
              contrastText: colors.white,
              light: colors.error.dark.main,
              dark: colors.error.dark.main,
              main: colors.error.dark.main,
            },
            info: {
              contrastText: colors.white,
              light: colors.turquoise.dark,
              dark: colors.turquoise.dark,
              main: colors.turquoise.dark,
            },
            grey: {
              ...colors.grey,
            },
            common: {
              black: colors.black,
              white: colors.white,
            },
            biamp: {
              contrastText: colors.white,
              dark: colors.biamp,
              light: colors.biamp,
              main: colors.biamp,
            },
            purple: {
              contrastText: colors.white,
              dark: colors.purple.dark,
              light: colors.purple.light,
              main: colors.purple.main,
            },
            blue: {
              contrastText: colors.white,
              dark: colors.blue.dark,
              light: colors.blue.hover,
              main: colors.blue.main,
            },
            sidebar: {
              contrastText: colors.white,
              dark: colors.sidebar,
              light: colors.sidebar,
              main: colors.sidebar,
            },
            primary: {
              contrastText: colors.grey[900],
              dark: colors.white,
              light: colors.white,
              main: colors.white,
            },
            text: {
              primary: colors.grey[50],
              secondary: colors.grey[500],
              disabled: alpha(colors.white, 0.4),
              sidebar: colors.sidebar,
            },
            background: {
              default: colors.grey[900],
              paper: colors.grey[800],
              success: colors.success.dark.background,
              warning: colors.warning.dark.background,
              error: colors.error.dark.background,
              info: colors.info.dark.background,
            },
            action: {
              disabled: alpha(colors.white, 0.4),
              disabledBackground: alpha(colors.white, 0.12),
            },
            divider: alpha(colors.white, 0.15),
            dividers: {
              primary: alpha(colors.white, 0.15),
              secondary: alpha(colors.white, 0.4),
            },
          },
        },
      },
      typography: {
        fontFamily: '"Inter", sans-serif',
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h0: {
          fontSize: '2.5rem',
          fontWeight: 500,
          letterSpacing: '-0.05rem',
          lineHeight: 1,
        },
        h1: {
          fontSize: '1.75rem',
          fontWeight: 600,
          letterSpacing: '-0.035rem',
          lineHeight: 1.2,
        },
        h2: {
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.025rem',
          lineHeight: 1.25,
        },
        h3: {
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '-0.02rem',
          lineHeight: 1.5,
        },
        h4: {
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '-0.02rem',
          lineHeight: 1.5,
        },
        body1: {
          fontSize: '1rem',
          fontWeight: 400,
          letterSpacing: '-0.02rem',
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          fontWeight: 400,
          letterSpacing: '-0.018rem',
          lineHeight: 1.43,
        },
        caption: {
          fontSize: '0.75rem',
          fontWeight: 400,
          letterSpacing: '-0.015rem',
          lineHeight: 1.5,
        },
        subtitle1: {
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: 1.43,
        },
        subtitle2: {
          fontSize: '0.75rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        button: {
          fontSize: '0.875rem',
          letterSpacing: '-0.018rem',
          fontWeight: 600,
          textTransform: 'none',
          lineHeight: 1.43,
        },
        sidebar: {
          fontWeight: 700,
          fontSize: '0.563rem',
          lineHeight: 1.5,
          letterSpacing: '-0.013rem',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
        @font-face {
          font-family: 'Inter';
          font-weight: 400;
          font-style: normal;
          font-display: swap;
          src: url(${InterRegular}) format('woff2');
        }

        @font-face {
          font-family: 'Inter';
          font-weight: 500;
          font-style: normal;
          font-display: swap;
          src: url(${InterMedium}) format('woff2');
        }

        @font-face {
          font-family: 'Inter';
          font-weight: 600;
          font-style: normal;
          font-display: swap;
          src: url(${InterSemiBold}) format('woff2');
        }

        @font-face {
          font-family: 'Inter';
          font-weight: 700;
          font-style: normal;
          font-display: swap;
          src: url(${InterBold}) format('woff2');
        }

        [class*="Mui"]:not([class*="MuiDivider"]) {
          border-width: 0.6px !important;
        }
    `,
        },
        MuiAlert: {
          defaultProps: {
            iconMapping: {
              error: <ErrorStatusIcon sx={{ width: 14, height: 14 }} />,
              warning: <WarningStatusIcon sx={{ width: 16, height: 14 }} />,
              info: <InfoStatusIcon sx={{ width: 14, height: 14 }} />,
              success: <SuccessStatusIcon sx={{ width: 14, height: 14 }} />,
            },
          },
          styleOverrides: {
            root: {
              paddingLeft: '12px',
              paddingRight: '12px',
              boxShadow: `0px 4px 50px 0px ${alpha(colors.grey[900], 0.1)}`,
              height: 'fit-content',
              width: 'fit-content',
              borderWidth: '1px !important',
              borderStyle: 'solid',
            },
            message: ({ theme }) => ({
              paddingTop: 0,
              paddingBottom: 0,
              fontSize: theme.typography.body1.fontSize,
              fontWeight: 600,
              letterSpacing: theme.typography.body1.letterSpacing,
              lineHeight: theme.typography.body1.lineHeight,
              alignItems: 'center',
              display: 'flex',
            }),
            icon: {
              paddingTop: 0,
              paddingBottom: 0,
              alignItems: 'center',
            },
            standard: ({ theme }) => ({
              color: theme.palette.text.primary,
              border: `16px solid ${theme.palette.success.main}`,
            }),
            standardError: ({ theme }) => ({
              border: `16px solid ${theme.palette.error.main}`,
              backgroundColor: theme.palette.background.error,
            }),
            standardInfo: ({ theme }) => ({
              border: `16px solid ${theme.palette.info.main}`,
              backgroundColor: theme.palette.background.info,
            }),
            standardSuccess: ({ theme }) => ({
              border: `16px solid ${theme.palette.success.main}`,
              backgroundColor: theme.palette.background.success,
            }),
            standardWarning: ({ theme }) => ({
              border: `16px solid ${theme.palette.warning.main}`,
              backgroundColor: theme.palette.background.warning,
            }),
          },
        },
        MuiButton: {
          defaultProps: {
            size: 'medium',
            disableElevation: true,
            disableRipple: true,
          },
          styleOverrides: {
            root: {
              boxShadow: `0px 1px 1px 0px ${alpha(colors.black, 0.05)}`,
              display: 'flex',
              gap: '8px',
              '& .MuiButton-startIcon': {
                marginRight: '0px',
                marginLeft: '0px',
              },
              '& .MuiButton-endIcon': {
                marginRight: '0px',
                marginLeft: '0px',
              },
            },
          },
          variants: [
            {
              props: { variant: 'contained' },
              style: ({ theme }) => ({
                border: `0.6px solid ${theme.palette.dividers.secondary}`,
                '&.Mui-disabled': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.sidebar,
                  border: `0.6px solid ${theme.palette.mode === 'dark' ? alpha(colors.white, 0.15) : alpha(colors.grey[900], 0.15)}`,
                },
              }),
            },
            {
              props: { variant: 'contained', color: 'primary' },
              style: {
                backgroundColor: colors.blue.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.blue.hover,
                },
                '&:active': {
                  backgroundColor: colors.blue.main,
                },
              },
            },
            {
              props: { variant: 'contained', color: 'error' },
              style: {
                backgroundColor: colors.red.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.red.dark,
                },
                '&:active': {
                  backgroundColor: colors.red.main,
                },
              },
            },
            {
              props: { variant: 'outlined' },
              style: {
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                },
              },
            },
            {
              props: { variant: 'outlined', color: 'primary' },
              style: ({ theme }) => ({
                border: `0.6px solid ${theme.palette.dividers.secondary}`,
                '&:hover': {
                  border: `0.6px solid ${theme.palette.mode === 'dark' ? alpha(colors.white, 0.8) : alpha(colors.grey[900], 0.8)}`,
                },
                '&:active': {
                  border: `0.6px solid ${theme.palette.mode === 'dark' ? colors.white : colors.grey[900]}`,
                },
              }),
            },
            {
              props: { variant: 'outlined', color: 'error' },
              style: {
                border: `0.6px solid ${alpha(colors.red.main, 0.1)}`,
                '&:hover': {
                  border: `0.6px solid ${alpha(colors.red.main, 0.4)}`,
                },
                '&:active': {
                  border: `0.6px solid ${colors.red.main}`,
                },
              },
            },
            {
              props: { variant: 'overlay' },
              style: {
                minHeight: '48px !important',
                height: '48px !important',
                borderRadius: '0px !important',
                width: '100%',
              },
            },
            {
              props: { variant: 'overlay', color: 'primary' },
              style: ({ theme }) => ({
                backgroundColor: colors.blue.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.blue.hover,
                },
                '&:active': {
                  backgroundColor: colors.blue.main,
                },
                '&.Mui-disabled': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.sidebar,
                },
              }),
            },
            {
              props: { variant: 'overlay', color: 'error' },
              style: ({ theme }) => ({
                backgroundColor: colors.red.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.red.dark,
                },
                '&:active': {
                  backgroundColor: colors.red.main,
                },
                '&.Mui-disabled': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.sidebar,
                },
              }),
            },
            {
              props: { variant: 'overlay', color: 'secondary' },
              style: ({ theme }) => ({
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.grey[900]
                    : colors.white,
                borderRight: `0.6px solid ${theme.palette.dividers.secondary}`,
              }),
            },
            {
              props: { size: 'medium' },
              style: ({ theme }) => ({
                borderRadius: '6px',
                fontSize: theme.typography.button.fontSize,
                letterSpacing: theme.typography.button.letterSpacing,
                fontWeight: theme.typography.button.fontWeight,
                textTransform: theme.typography.button.textTransform,
                lineHeight: theme.typography.button.lineHeight,
                paddingLeft: '16px',
                paddingRight: '16px',
                height: '44px',
              }),
            },
            {
              props: { size: 'small' },
              style: ({ theme }) => ({
                borderRadius: '4px',
                fontSize: '12px',
                letterSpacing: theme.typography.button.letterSpacing,
                fontWeight: theme.typography.button.fontWeight,
                textTransform: theme.typography.button.textTransform,
                lineHeight: theme.typography.button.lineHeight,
                paddingLeft: '12px',
                paddingRight: '12px',
                height: '32px',
                '& .MuiButton-startIcon': {
                  '& svg': {
                    width: '16px',
                    height: '16px',
                  },
                },
                '& .MuiButton-endIcon': {
                  '& svg': {
                    width: '16px',
                    height: '16px',
                  },
                },
              }),
            },
          ],
        },
        MuiBreadcrumbs: {
          defaultProps: {
            separator: <ChevronRightIcon variant="xs" />,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              font: theme.typography.body2.font,
              fontWeight: 600,
              '& button svg': {
                color: theme.palette.text.secondary,
              },
            }),
            separator: ({ theme }) => ({
              margin: 0,
              color: theme.palette.text.secondary,
              '& svg': {
                width: '16px',
                height: '16px',
              },
            }),
            ol: {
              padding: 0,
            },
            li: ({ theme }) => ({
              marginLeft: '8px',
              marginRight: '8px',
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 600,
              color: `${theme.palette.text.secondary} !important`,
              '&:last-child': {
                color: theme.palette.text.secondary,
              },
            }),
          },
        },
        MuiFab: {
          styleOverrides: {
            root: ({ theme }) => ({
              '&.Mui-disabled': {
                color: theme.palette.action.disabled,
                backgroundColor: theme.palette.action.disabledBackground,
              },
            }),
            primary: {
              backgroundColor: colors.blue.main,
              color: colors.white,
              '&:hover': {
                backgroundColor: alpha(colors.blue.main, 0.9),
              },
            },
          },
        },
        MuiIconButton: {
          defaultProps: {
            variant: 'transparent',
            color: 'primary',
            size: 'small',
            disableRipple: true,
          },
          styleOverrides: {
            root: {
              '& svg': {
                width: '16px',
                height: '16px',
              },
            },
          },
          variants: [
            {
              props: { variant: 'none' },
              style: {
                width: '28px',
                height: '28px',
              },
            },
            {
              props: { variant: 'transparent' },
              style: ({ theme }) => ({
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[800]
                      : colors.grey[50],
                },
                '&:active': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.grey[100],
                },
              }),
            },
            {
              props: { variant: 'outlined' },
              style: ({ theme }) => ({
                width: '32px',
                height: '32px',
                border: `0.6px solid ${theme.palette.dividers.secondary} !important`,
                borderRadius: '6px',
                '&:hover': {
                  border: `0.6px solid ${theme.palette.mode === 'dark' ? alpha(colors.white, 0.8) : alpha(colors.grey[900], 0.8)} !important`,
                },
                '&:active': {
                  border: `0.6px solid ${theme.palette.mode === 'dark' ? colors.white : colors.grey[900]} !important`,
                },
              }),
            },
            {
              props: { size: 'small' },
              style: {
                '& svg': {
                  width: '16px',
                  height: '16px',
                },
              },
            },
            {
              props: { size: 'medium' },
              style: {
                width: '32px',
                height: '32px',
                '& svg': {
                  width: '24px',
                  height: '24px',
                },
                '& .MuiCircularProgress-root': {
                  width: '24px !important',
                  height: '24px !important',
                },
              },
            },
          ],
        },
        MuiCheckbox: {
          defaultProps: {
            disableRipple: true,
            icon: <UncheckedIcon sx={{ width: 16, height: 16 }} />,
            checkedIcon: <CheckedIcon sx={{ width: 16, height: 16 }} />,
            indeterminateIcon: (
              <IndeterminateIcon sx={{ width: 16, height: 16 }} />
            ),
          },
          styleOverrides: {
            root: ({ theme }) => ({
              padding: '12px',
              '&.Mui-checked': {
                color: colors.blue.main,
              },
              '&.MuiCheckbox-indeterminate': {
                color: colors.blue.main,
              },
              '&.Mui-disabled': {
                color:
                  theme.palette.mode === 'dark'
                    ? colors.grey[700]
                    : colors.sidebar,
              },
              '&.Mui-disabled:not(.Mui-checked):not(.MuiCheckbox-indeterminate)':
                {
                  '& rect:first-of-type': {
                    fill:
                      theme.palette.mode === 'dark'
                        ? colors.grey[700]
                        : colors.sidebar,
                  },
                  '& rect:last-of-type': {
                    strokeOpacity: 0.15,
                  },
                },
            }),
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: { backgroundImage: 'none' },
          },
        },
        MuiDialogTitle: {
          defaultProps: {
            variant: 'h1',
          },
          styleOverrides: {
            root: ({ theme }) => ({
              padding: theme.spacing(2, 3, 1),
              '& + .MuiDialogContent-root': {
                paddingTop: `${theme.spacing(1)} !important`,
              },
            }),
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: ({ theme }) => ({
              display: 'flex',
              flexDirection: 'column',
              padding: theme.spacing(2, 3, 1),
            }),
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: ({ theme }) => ({
              '& *:nth-last-of-type(n + 3):first-of-type': {
                marginRight: 'auto',
              },
              padding: theme.spacing(1, 3, 2),
            }),
          },
        },
        MuiDialogContentText: {
          styleOverrides: {
            root: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
              color: theme.palette.text.primary,
            }),
          },
        },
        MuiDrawer: {
          styleOverrides: {
            root: { width: drawerWidth },
            paper: {
              width: drawerWidth,
              backgroundImage: 'none',
              '& .MuiListItemButton-root': {
                color: colors.sidebar,
              },
              '& .MuiListItemButton-root.Mui-selected': {
                backgroundColor: alpha(colors.white, 0.1),
                color: colors.white,
                '&:hover': {
                  backgroundColor: alpha(colors.white, 0.1),
                },
              },
              '& .MuiListItemButton-root:hover': {
                backgroundColor: alpha(colors.white, 0.1),
                color: colors.white,
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: ({ theme }) => ({
              borderColor: theme.palette.divider,
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 600,
              '&:not(.MuiDivider-withChildren)': {
                borderTopWidth: '0.6px',
                borderBottomWidth: 0,
              },
              '&.MuiDivider-withChildren': {
                '&::before, &::after': {
                  borderWidth: '0.6px',
                },
              },
            }),
          },
        },
        MuiFormControlLabel: {
          styleOverrides: {
            label: {
              flex: 1,
            },
            labelPlacementStart: {
              display: 'flex',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: ({ theme }) => ({
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.Mui-focusVisible': {
                  backgroundColor: theme.palette.action.focus,
                },
              },
            }),
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              position: 'relative',
              height: '100%',
              overflow: 'auto',
              overscrollBehavior: 'none',
            },
          },
        },
        MuiTable: {
          defaultProps: {
            stickyHeader: true,
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: ({ theme }) => ({
              '& .MuiTableCell-head': {
                height: 40,
                paddingTop: 0,
                paddingBottom: 0,
                color: theme.palette.text.secondary,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
                borderBottom: 'none',
                '&:first-of-type': {
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                },
                '&:last-of-type': {
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                },
                '&:not(:last-of-type)::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: 9,
                  bottom: 9,
                  width: '0.6px',
                  backgroundColor: theme.palette.divider,
                },
              },
            }),
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: ({ theme }) => ({
              borderBottomColor: theme.palette.divider,
              paddingLeft: theme.spacing(1.5),
              paddingRight: theme.spacing(1.5),
              paddingTop: 0,
              paddingBottom: 0,
              height: 52,
              overflowWrap: 'break-word',
            }),
            paddingCheckbox: {
              padding: '0 !important',
              textAlign: 'center',
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: ({ theme }) => ({
              '&.MuiTableRow-hover:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
              },
              '&.Mui-selected': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[50],
                },
              },
              '&:last-child td': {
                borderBottom: 'none',
              },
            }),
          },
        },
        MuiTableSortLabel: {
          defaultProps: {
            IconComponent: DropdownChevronDuoIcon,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              '&:hover': {
                color: theme.palette.text.primary,
              },
              '&:focus:not(:hover)': {
                color: 'unset',
              },
              '&:focus-visible': {
                textDecoration: 'underline',
                '& .MuiTableSortLabel-icon': {
                  opacity: 0.5,
                },
              },
              '&.Mui-active': {
                color: theme.palette.text.primary,
                fontWeight: 600,
                '& .MuiTableSortLabel-icon': {
                  color: theme.palette.text.primary,
                  opacity: 1,
                },
              },
            }),
            icon: ({ theme }) => ({
              fontSize: 16,
              transform: 'none',
              marginLeft: '12px',
              marginRight: 0,
              transition: theme.transitions.create(['transform', 'opacity'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
            }),
          },
        },
        MuiTablePagination: {
          defaultProps: {
            slots: {
              actions: {
                firstButtonIcon: ChevronFullLeftIcon,
                lastButtonIcon: ChevronFullRightIcon,
                previousButtonIcon: ChevronLeftIcon,
                nextButtonIcon: ChevronRightIcon,
              },
            },
          },
          styleOverrides: {
            root: {
              minHeight: 40,
            },
            toolbar: {
              minHeight: '40px !important',
              paddingLeft: 0,
              paddingRight: 0,
            },
            actions: {
              marginLeft: 36,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundColor: theme.palette.background.paper,
              minHeight: '44px',
              '&:not(.MuiInputBase-multiline):not(.MuiAutocomplete-inputRoot)':
                {
                  height: '44px',
                },
              '&.Mui-disabled': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.grey[800]
                    : colors.grey[100],
              },
            }),
          },
        },
        MuiRadio: {
          defaultProps: {
            disableRipple: true,
            icon: <RadioUncheckedIcon />,
            checkedIcon: <RadioCheckedIcon />,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              color: colors.grey[400],
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&.Mui-focusVisible': {
                backgroundColor: 'transparent',
              },
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 18,
              },
              '&.Mui-disabled': {
                '& .radio-ring': {
                  stroke:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.sidebar,
                },
                '& .radio-dot': {
                  fill:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.sidebar,
                },
              },
            }),
          },
        },
        MuiChip: {
          defaultProps: {
            deleteIcon: <CloseIcon variant="xxs" />,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundColor: theme.palette.background.info,
              height: 'auto',
              color: theme.palette.text.primary,
              borderRadius: 999,
              border: `0.6px solid ${theme.palette.dividers.secondary}`,
              padding: '0px 12px',
              '&:has(.MuiChip-deleteIcon)': {
                padding: '0px 8px 0px 12px',
              },
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.caption.fontWeight,
              letterSpacing: theme.typography.caption.letterSpacing,
              lineHeight: theme.typography.caption.lineHeight,
            }),
            label: ({ theme }) => ({
              padding: 0,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.caption.fontWeight,
              letterSpacing: theme.typography.caption.letterSpacing,
              lineHeight: theme.typography.caption.lineHeight,
              color: theme.palette.text.primary,
            }),
            icon: {
              marginLeft: 0,
              marginRight: 4,
              width: 12,
              height: 12,
              fontSize: 12,
            },
            deleteIcon: ({ theme }) => ({
              margin: 0,
              marginLeft: 8,
              fontSize: 12,
              color: theme.palette.text.primary,
              '& hover': {
                color: theme.palette.text.secondary,
              },
            }),
          },
        },
        MuiSwitch: {
          styleOverrides: {
            root: {
              width: 54,
              height: 38,
              padding: 9,
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            },
            switchBase: ({ theme }) => ({
              padding: 9,
              '&:hover': {
                backgroundColor: 'transparent !important',
              },
              '&.Mui-checked': {
                transform: 'translateX(16px)',
                '& + .MuiSwitch-track': {
                  backgroundColor: colors.blue.main,
                  opacity: 1,
                },
              },
              '&.Mui-disabled': {
                '& .MuiSwitch-thumb': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[800]
                      : colors.grey[100],
                },
                '& + .MuiSwitch-track': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[800]
                      : colors.grey[100],
                  opacity: 1,
                },
              },
            }),
            track: ({ theme }) => ({
              borderRadius: 10,
              width: 36,
              height: 20,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? colors.grey[800]
                  : colors.grey[50],
              opacity: 1,
              border:
                theme.palette.mode === 'dark'
                  ? `0.6px solid var(--Divider-divider_primary, ${alpha(colors.white, 0.26)})`
                  : `0.6px solid var(--Divider-divider_primary, ${alpha(colors.grey[900], 0.26)})`,
            }),
            thumb: ({ theme }) => ({
              boxShadow: `0px 1px 2px 0px ${alpha('#101828', 0.15)}`,
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
              width: 14,
              height: 14,
              margin: 3,
              backgroundColor: colors.white,
              border:
                theme.palette.mode === 'dark'
                  ? `0.6px solid var(--Divider-divider_primary, ${alpha(colors.white, 0.26)})`
                  : `0.6px solid var(--Divider-divider_primary, ${alpha(colors.grey[900], 0.26)})`,
            }),
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              height: 44,
              minHeight: 44,
              '& .MuiTabs-indicator': {
                backgroundColor: colors.blue.main,
              },
              '& MuiButtonBase-root': {
                height: 32,
                minHeight: 32,
              },
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            },
            flexContainer: {
              gap: 20,
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: ({ theme }) => ({
              fontWeight: 600,
              fontSize: theme.typography.body2.fontSize,
              lineHeight: theme.typography.body2.lineHeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              paddingLeft: 1,
              paddingRight: 1,
              minWidth: 'auto',
              paddingTop: '0px',
              paddingBottom: '0px',
              height: 44,
              minHeight: 44,
              opacity: 1,
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }),
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: ({ theme }) => ({
              backgroundColor: theme.palette.grey[600],
              borderRadius: '6px',
              fontSize: theme.typography.caption.fontSize,
              fontWeight: 500,
              letterSpacing: theme.typography.caption.letterSpacing,
              lineHeight: theme.typography.caption.lineHeight,
              paddingTop: '8px',
              paddingBottom: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              maxWidth: 'fit-content',
            }),
            arrow: ({ theme }) => ({
              color: theme.palette.grey[600],
            }),
          },
        },
        MuiTextField: {
          defaultProps: {
            InputLabelProps: {
              shrink: true,
            },
          },
          styleOverrides: {
            root: ({ theme }) => ({
              '& .MuiInputBase-input': {
                padding: '0px 12px',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: theme.palette.dividers.secondary,
                },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: theme.palette.text.primary,
                },
              '& .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root svg':
                {
                  color: theme.palette.text.primary,
                },
              '& .MuiInputAdornment-positionStart': {
                marginRight: '-4px',
              },
              '& .MuiInputAdornment-positionEnd': {
                marginRight: '12px',
              },
              '& .MuiInputAdornment-root svg': {
                width: '24px',
                height: '24px',
              },
            }),
          },
        },
        MuiInputLabel: {
          defaultProps: {
            shrink: true,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              position: 'relative',
              transform: 'none',
              marginBottom: theme.spacing(0.75),
              fontSize: theme.typography.caption.fontSize,
              fontWeight: 600,
              color: theme.palette.text.primary,
              '&.Mui-focused': {
                color: theme.palette.text.primary,
              },
              '&.Mui-error': {
                color: theme.palette.error.main,
              },
              '&.Mui-disabled': {
                color: theme.palette.text.disabled,
              },
            }),
            shrink: {
              transform: 'none',
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              padding: 0,
              borderRadius: '6px',
              '&:not(.MuiInputBase-multiline):not(.MuiAutocomplete-inputRoot)':
                {
                  '& .MuiOutlinedInput-notchedOutline': {
                    height: '44px',
                    legend: {
                      display: 'none',
                    },
                  },
                },
              '&.MuiInputBase-multiline': {
                '& .MuiOutlinedInput-notchedOutline': {
                  height: 'auto',
                  legend: {
                    display: 'none',
                  },
                },
              },
            },
            input: ({ theme }) => ({
              '&:not(textarea)': {
                height: '44px',
              },
              '&.MuiInputBase-inputMultiline': {
                margin: theme.spacing(1),
              },
              boxSizing: 'border-box',
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
            }),
            notchedOutline: {
              top: 0,
              boxShadow: `0px 1px 1px 0px ${alpha(colors.black, 0.05)};`,
              '& legend': {
                display: 'none',
              },
            },
          },
        },
        MuiFormLabel: {
          styleOverrides: {
            root: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }),
          },
        },
        MuiFormHelperText: {
          styleOverrides: {
            root: ({ theme }) => ({
              marginLeft: 0,
              marginRight: 0,
              marginTop: theme.spacing(0.5),
            }),
          },
        },
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              '& .MuiSvgIcon-root': {
                width: '16px',
                height: '16px',
              },
            },
            positionStart: {
              marginLeft: '8px',
            },
            positionEnd: {
              marginRight: '8px',
            },
          },
        },
        MuiMenu: {
          defaultProps: {
            transitionDuration: 0,
          },
          styleOverrides: {
            paper: ({ theme }) => ({
              boxShadow: `0px 1px 1px 0px ${alpha(colors.black, 0.05)}`,
              borderRadius: '6px',
              border: `0.6px solid ${theme.palette.dividers.secondary}`,
              backgroundImage: 'none',
              marginTop: theme.spacing(1),
            }),
          },
        },
        MuiList: {
          styleOverrides: {
            root: {
              paddingTop: '0px',
              paddingBottom: '0px',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
              paddingTop: '0px',
              paddingBottom: '0px',
              paddingLeft: '12px',
              paddingRight: '12px',
              minHeight: '44px !important',
            }),
          },
        },
        MuiAutocomplete: {
          defaultProps: {
            clearIcon: <CloseIcon variant="xxs" />,
          },
          styleOverrides: {
            inputRoot: {
              minHeight: '44px',
              height: 'auto',
              columnGap: '2px !important',
              paddingTop: 'auto !important',
              paddingLeft: '12px !important',
              paddingBottom: 'auto !important',
              paddingRight: '60px !important',
              borderRadius: '6px',
              '& .MuiOutlinedInput-input': {
                padding: '10px 14px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                height: 'auto',
              },
            },
            input: {
              width: '100px !important',
              height: 'auto',
              padding: '0px !important',
              paddingRight: '8px !important',
              boxSizing: 'border-box',
              minWidth: '60px !important',
            },
            endAdornment: {
              '& .MuiAutocomplete-clearIndicator': {
                visibility: 'visible',
              },
            },
            option: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
              paddingTop: '0px !important',
              paddingBottom: '0px !important',
              paddingLeft: '12px !important',
              paddingRight: '12px !important',
              minHeight: '44px !important',
            }),
            listbox: {
              paddingTop: '0px',
              paddingBottom: '0px',
            },
            paper: ({ theme }) => ({
              boxShadow: `0px 1px 1px 0px ${alpha(colors.black, 0.05)}`,
              borderRadius: '6px',
              border: `0.6px solid ${theme.palette.dividers.secondary}`,
              backgroundImage: 'none',
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
            }),
          },
        },
        MuiDatePicker: {
          defaultProps: {
            enableAccessibleFieldDOMStructure: false,
            slots: {
              openPickerIcon: CalendarIcon,
            },
            slotProps: {
              openPickerButton: {
                size: 'medium',
                sx: {
                  '&:hover': { backgroundColor: 'transparent' },
                },
              },
              inputAdornment: {
                sx: { mx: '4px' },
              },
              textField: {
                sx: {
                  paddingLeft: '0px',
                  '& .MuiInputLabel-root': {
                    fontWeight: '600',
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    fontWeight: '400',
                  },
                  '& .MuiInputBase-root': {
                    padding: '0px 12px',
                    '& .MuiInputBase-input': {
                      padding: '0px',
                    },
                  },
                },
              },
            },
          },
        },
        MuiTimePicker: {
          defaultProps: {
            timeSteps: { minutes: 15 },
            viewRenderers: {
              hours: renderDigitalClockTimeView,
              minutes: null,
              seconds: null,
            },
            slots: {
              openPickerIcon: ClockTimeIcon,
            },
            slotProps: {
              openPickerButton: {
                size: 'medium',
              },
              openPickerIcon: {
                fontSize: 'medium',
              },
              inputAdornment: {
                sx: {
                  marginRight: '6px',
                  marginLeft: '0px',
                  '& .MuiSvgIcon-root': {
                    width: '20px',
                    height: '20px',
                  },
                },
              },
              digitalClockSectionItem: {
                sx: { px: '0px', pl: '12px' },
              },
              toolbar: {
                hidden: true,
              },
              actionBar: {
                actions: [],
              },
              desktopPaper: {
                sx: (theme) => ({
                  border: `0.6px solid ${theme.palette.dividers.secondary}`,
                  width: '115px',
                  overflowX: 'hidden',
                }),
              },
            },
          },
        },
        MuiDigitalClock: {
          styleOverrides: {
            root: {
              fontSize: '14px',
            },
            item: ({ theme }) => ({
              margin: '0px',
              '&.Mui-selected': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.grey[800]
                    : colors.grey[50],
                color: 'inherit',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[800]
                      : colors.grey[50],
                },
              },
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            }),
            list: {
              '& li:first-of-type': {
                marginTop: 0,
              },
            },
          },
        },
        MuiPickersTextField: {
          styleOverrides: {
            root: {
              '& .MuiInputBase-root': {
                height: '44px',
                borderRadius: '6px',
              },
              '& .MuiOutlinedInput-root': {
                height: '44px',
                borderRadius: '6px',
              },
              '& .MuiOutlinedInput-input': {
                height: '44px',
                padding: '10px 12px',
                boxSizing: 'border-box',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                height: '44px',
                top: 0,
                borderRadius: '6px',
                '& legend': {
                  display: 'none',
                  width: 0,
                  height: 0,
                },
              },
            },
          },
        },
        MuiPickersInputBase: {
          styleOverrides: {
            root: {
              height: '44px !important',
              borderRadius: '6px',
              backgroundColor: 'background.paper',
              fontSize: '14px',
              '& .MuiInputBase-input': {
                height: '44px',
                padding: '10px 12px',
                boxSizing: 'border-box',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                height: '44px',
                top: 0,
                borderRadius: '6px',
                '& legend': {
                  display: 'none',
                  width: 0,
                  height: 0,
                },
              },
            },
          },
        },
        MuiPickersOutlinedInput: {
          styleOverrides: {
            root: ({ theme }) => ({
              height: '44px !important',
              borderRadius: '6px',
              padding: '0px 12px',
              backgroundColor: theme.palette.background.paper,
              '& .MuiOutlinedInput-input': {
                height: '44px',
                padding: '10px 12px',
                boxSizing: 'border-box',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                height: '44px',
                top: 0,
                borderRadius: '6px',
                '& legend': {
                  display: 'none',
                  width: 0,
                  height: 0,
                },
              },
            }),
            input: {
              height: '44px',
              padding: '10px 12px',
              boxSizing: 'border-box',
            },
            notchedOutline: {
              height: '44px',
              top: 0,
              borderRadius: '6px',
              '& legend': {
                display: 'none',
                width: 0,
                height: 0,
              },
            },
          },
        },
        MuiPickersSectionList: {
          styleOverrides: {
            root: {
              opacity: 1,
            },
          },
        },
        MuiPickerPopper: {
          styleOverrides: {
            root: () => ({
              inset: '8px auto auto 0px !important',
              borderColor: colors.grey[900],
            }),
            paper: ({ theme }: { theme: Theme }) => ({
              borderRadius: '6px',
              backgroundColor: theme.palette.background.paper,
              boxShadow: 'none',
              borderWidth: '0.6px',
              borderStyle: 'solid',
              borderColor: theme.palette.dividers.secondary,
            }),
          },
        },
        MuiPickersLayout: {
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundColor: theme.palette.background.paper,
              borderRadius: '6px',
              '&:has(.MuiDateCalendar-root)': {
                minWidth: '280px',
              },
            }),
          },
        },
        MuiPickersSlideTransition: {
          styleOverrides: {
            root: {
              overflowX: 'visible',
              minHeight: 'auto',
            },
          },
        },
        MuiDateCalendar: {
          defaultProps: {
            slots: {
              calendarHeader: CustomCalendarHeader,
            },
          },
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundColor: theme.palette.background.paper,
              borderRadius: '6px',
              width: 'auto',
            }),
          },
        },
        MuiPickersCalendarHeader: {
          styleOverrides: {
            root: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '12px',
              paddingRight: '4px',
            },
            label: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 600,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
              color: theme.palette.text.primary,
            }),
            labelContainer: {
              order: 2, // center the label
            },
            switchViewButton: ({ theme }) => ({
              color: theme.palette.text.primary,
              order: 2,
            }),
          },
        },
        MuiPickersArrowSwitcher: {
          styleOverrides: {
            button: ({ theme }) => ({
              color: theme.palette.text.primary,
            }),
          },
        },
        MuiDayCalendar: {
          styleOverrides: {
            weekDayLabel: ({ theme }) => ({
              fontSize: theme.typography.body1.fontSize,
              fontWeight: theme.typography.fontWeightMedium,
              letterSpacing: theme.typography.body1.letterSpacing,
              lineHeight: theme.typography.body1.lineHeight,
              color: theme.palette.text.primary,
              marginLeft: '0px',
              marginRight: '0px',
              minWidth: '40px',
              minHeight: '40px',
            }),
            slideTransition: {
              minHeight: '220px',
            },
          },
        },
        MuiPickersDay: {
          styleOverrides: {
            root: ({ theme }) => ({
              fontSize: theme.typography.body2.fontSize,
              fontWeight: theme.typography.body2.fontWeight,
              letterSpacing: theme.typography.body2.letterSpacing,
              lineHeight: theme.typography.body2.lineHeight,
              color: theme.palette.text.primary,
              minWidth: '40px',
              minHeight: '40px',
              marginLeft: '0px',
              marginRight: '0px',
              borderRadius: '4px',
              '&.Mui-selected': {
                backgroundColor: theme.palette.text.primary,
                color: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.text.primary,
                },
                '&:focus': {
                  backgroundColor: theme.palette.text.primary,
                },
              },
              '&.MuiPickersDay-today': {
                border: `0px solid ${theme.palette.text.primary}`,
                '&:not(.Mui-selected)': {
                  backgroundColor: 'transparent',
                },
              },
            }),
          },
        },
        MuiSlider: {
          styleOverrides: {
            root: {
              height: 16,
              color: colors.blue.main,
              '&.Mui-disabled': {
                '& .MuiSlider-track': {
                  '&::before, &::after': {
                    backgroundColor: colors.grey[400],
                  },
                },
              },
            },
            rail: ({ theme }) => ({
              position: 'relative',
              opacity: 1,
              height: 16,
              borderRadius: 8,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? colors.grey[800]
                  : colors.grey[50],
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: 0,
                width: 30,
                height: 16,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.grey[800]
                    : colors.grey[50],
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -8,
                top: 0,
                width: 30,
                height: 16,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.grey[800]
                    : colors.grey[50],
              },
            }),
            track: {
              height: 16,
              borderRadius: 0,
              border: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: 0,
                width: 8,
                height: 16,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                backgroundColor: colors.blue.main,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -8,
                top: 0,
                width: 8,
                height: 16,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor: colors.blue.main,
              },
            },
            thumb: ({ theme }) => ({
              width: 14,
              height: 14,
              backgroundColor: colors.white,
              boxShadow: `0px 8px 8px 0px ${alpha(theme.palette.common.black, 0.05)}`,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `none`,
              },
              '&.Mui-active': {
                boxShadow: `none`,
              },
            }),
          },
        },
        MuiBadge: {
          defaultProps: {
            showZero: true,
            variant: 'round',
          },
          styleOverrides: {
            badge: ({ theme }) => ({
              fontFamily: theme.typography.fontFamily,
              fontWeight: theme.typography.fontWeightMedium,
              letterSpacing: theme.typography.caption.letterSpacing,
              lineHeight: theme.typography.caption.lineHeight,
              '&.MuiBadge-dot': {
                padding: '0px',
              },
              '.Mui-disabled &': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[700]
                    : theme.palette.action.disabledBackground,
                color: theme.palette.grey[400],
              },
            }),
          },
          variants: (() => {
            const rectangle = {
              borderRadius: '8px',
              paddingLeft: '8px',
              paddingRight: '8px',
            };
            const round = {
              borderRadius: '999px',
              padding: '0px',
              width: '14px',
              height: '14px',
              minWidth: 'auto',
              fontSize: '0.563rem',
            };
            const inline = { position: 'static', transform: 'none' };
            return [
              {
                props: { variant: 'rectangle' },
                style: { '& .MuiBadge-badge': { ...rectangle } },
              },
              {
                props: { variant: 'round' },
                style: { '& .MuiBadge-badge': { ...round } },
              },
              {
                props: { variant: 'rectangle-inline' },
                style: { '& .MuiBadge-badge': { ...rectangle, ...inline } },
              },
              {
                props: { variant: 'round-inline' },
                style: { '& .MuiBadge-badge': { ...round, ...inline } },
              },
            ];
          })(),
        },
      },
    },
    overrideOptions,
  );
