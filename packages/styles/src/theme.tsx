import {
  CheckedIcon,
  ChevronRight,
  DatePickerIcon,
  ErrorStatusIcon,
  IndeterminateIcon,
  InfoStatusIcon,
  InputCloseIcon,
  MontserratBold,
  MontserratMedium,
  MontserratSemiBold,
  OpenSansBold,
  OpenSansBoldItalic,
  OpenSansExtraBold,
  OpenSansExtraBoldItalic,
  OpenSansRegular,
  OpenSansRegularItalic,
  OpenSansSemiBold,
  OpenSansSemiBoldItalic,
  RadioCheckedIcon,
  RadioUncheckedIcon,
  SuccessStatusIcon,
  UncheckedIcon,
  WarningStatusIcon,
} from '@bwp-web/assets';
import { alpha, createTheme } from '@mui/material/styles';

const colors = {
  black: '#000000',
  white: '#ffffff',
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#c9c9c9',
    400: '#878787',
    500: '#646464',
    600: '#484848',
    700: '#333333',
    800: '#222222',
    900: '#111111',
  },
  blue: {
    dark: '#1863D3',
    light: '#1863D3',
    main: '#1863D3',
    drawer: '#3F8CFF',
  },
  purple: {
    dark: '#635BFF',
    light: '#A64DEF',
    main: '#5B00EF',
  },
  biamp: '#d22730',
  sidebar: '#E0E0E0',
  action: {
    disabled: '#11111166',
    disabledBackground: '#E0E0E0',
  },
  success: {
    dark: {
      main: '#00E941',
      background: '#093615',
    },
    light: {
      main: '#008A05',
      background: '#EAFEF0',
    },
  },
  warning: {
    dark: {
      main: '#FFB800',
      background: '#41320E',
    },
    light: {
      main: '#E06C00',
      background: '#FFF4D9',
    },
  },
  error: {
    dark: {
      main: '#FF1744',
      background: '#2E1016',
    },
    light: {
      main: '#E0002D',
      background: '#FFEDF0',
    },
  },
  info: {
    dark: {
      main: '#1863D3',
      background: '#101C25',
    },
    light: {
      main: '#1863D3',
      background: '#EBF7FF',
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
              dark: colors.info.light.main,
              light: colors.info.light.main,
              main: colors.info.light.main,
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
              light: colors.blue.light,
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
              secondary: colors.grey[400],
              disabled: alpha(colors.grey[900], 0.4),
              sidebar: colors.sidebar,
            },
            background: {
              default: colors.white,
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
              light: colors.info.dark.main,
              dark: colors.info.dark.main,
              main: colors.info.dark.main,
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
              light: colors.blue.light,
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
              primary: colors.white,
              secondary: colors.grey[400],
              disabled: alpha(colors.white, 0.4),
              sidebar: colors.sidebar,
            },
            background: {
              default: colors.grey[900],
              paper: colors.grey[900],
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
        fontFamily: '"Open Sans", sans-serif',
        fontWeightRegular: 400,
        fontWeightMedium: 600,
        fontWeightBold: 600,
        h0: {
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '3.5rem',
          fontWeight: 500,
          letterSpacing: '-0.105rem',
          lineHeight: 1.1,
        },
        h1: {
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '1.75rem',
          fontWeight: 500,
          letterSpacing: '-0.07rem',
          lineHeight: 1.2,
        },
        h2: {
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.025rem',
          lineHeight: 1.5,
        },
        h3: {
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '-0.02rem',
          lineHeight: 1.5,
        },
        h4: {
          fontFamily: '"Montserrat", sans-serif',
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
          lineHeight: 1.5,
        },
        caption: {
          fontSize: '0.75rem',
          fontWeight: 400,
          letterSpacing: '-0.015rem',
          lineHeight: 1.5,
        },
        subtitle1: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        subtitle2: {
          fontSize: '0.75rem',
          lineHeight: 1.5,
        },
        button: {
          fontSize: '0.875rem',
          letterSpacing: '-0.018rem',
          fontWeight: 600,
          textTransform: 'none',
          lineHeight: 1.5,
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
          font-family: 'Open Sans';
          font-weight: 400;
          font-style: normal;
          font-display: swap;
          src: url(${OpenSansRegular}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 400;
          font-style: italic;
          font-display: swap;
          src: url(${OpenSansRegularItalic}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 600;
          font-style: normal;
          font-display: swap;
          src: url(${OpenSansSemiBold}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 600;
          font-style: italic;
          font-display: swap;
          src: url(${OpenSansSemiBoldItalic}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 700;
          font-style: normal;
          font-display: swap;
          src: url(${OpenSansBold}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 700;
          font-style: italic;
          font-display: swap;
          src: url(${OpenSansBoldItalic}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 800;
          font-style: normal;
          font-display: swap;
          src: url(${OpenSansExtraBold}) format('woff2');
        }

        @font-face {
          font-family: 'Open Sans';
          font-weight: 800;
          font-style: italic;
          font-display: swap;
          src: url(${OpenSansExtraBoldItalic}) format('woff2');
        }

        @font-face {
          font-family: 'Montserrat';
          font-weight: 500;
          font-style: normal;
          font-display: swap;
          src: url(${MontserratMedium}) format('truetype');
        }

        @font-face {
          font-family: 'Montserrat';
          font-weight: 600;
          font-style: normal;
          font-display: swap;
          src: url(${MontserratSemiBold}) format('truetype');
        }

        @font-face {
          font-family: 'Montserrat';
          font-weight: 700;
          font-style: normal;
          font-display: swap;
          src: url(${MontserratBold}) format('truetype');
        }

        [class*="Mui"] {
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
            message: ({ theme }) => ({
              paddingTop: 0,
              paddingBottom: 0,
              fontSize: theme.typography.body1.fontSize,
              fontWeight: 600,
              letterSpacing: theme.typography.body1.letterSpacing,
              lineHeight: theme.typography.body1.lineHeight,
            }),
            icon: {
              paddingTop: 0,
              paddingBottom: 0,
            },
            standard: ({ theme }) => ({
              color: theme.palette.text.primary,
              border: `1px solid`,
            }),
            standardError: ({ theme }) => ({
              borderColor: theme.palette.error.main,
              backgroundColor: theme.palette.background.error,
            }),
            standardInfo: ({ theme }) => ({
              borderColor: theme.palette.info.main,
              backgroundColor: theme.palette.background.info,
            }),
            standardSuccess: ({ theme }) => ({
              borderColor: theme.palette.success.main,
              backgroundColor: theme.palette.background.success,
            }),
            standardWarning: ({ theme }) => ({
              borderColor: theme.palette.warning.main,
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
                  backgroundColor: colors.blue.drawer,
                },
                '&:active': {
                  backgroundColor: colors.blue.main,
                },
              },
            },
            {
              props: { variant: 'contained', color: 'error' },
              style: {
                backgroundColor: colors.error.light.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.error.dark.main,
                },
                '&:active': {
                  backgroundColor: colors.error.light.main,
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
                border: `0.6px solid ${alpha(colors.error.light.main, 0.1)}`,
                '&:hover': {
                  border: `0.6px solid ${alpha(colors.error.light.main, 0.4)}`,
                },
                '&:active': {
                  border: `0.6px solid ${colors.error.light.main}`,
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
                  backgroundColor: colors.blue.drawer,
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
                backgroundColor: colors.error.light.main,
                color: colors.white,
                '&:hover': {
                  backgroundColor: colors.error.dark.main,
                },
                '&:active': {
                  backgroundColor: colors.error.light.main,
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
            separator: <ChevronRight />,
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
                      : colors.grey[100],
                },
                '&:active': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.grey[700]
                      : colors.grey[200],
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
              borderTopWidth: '0px !important',
              borderBottomWidth: '0.6px !important',
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
        MuiTableCell: {
          styleOverrides: {
            root: ({ theme }) => ({
              borderBottomColor: theme.palette.divider,
            }),
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
            checkedIcon: (
              <RadioCheckedIcon
                ringColor={colors.grey[400]}
                dotColor={colors.blue.main}
              />
            ),
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
        MuiSwitch: {
          styleOverrides: {
            root: {
              width: 54,
              height: 38,
              padding: 9,
            },
            switchBase: ({ theme }) => ({
              padding: 9,
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
                  : colors.grey[100],
              opacity: 1,
              border:
                theme.palette.mode === 'dark'
                  ? `0.6px solid var(--Divider-divider_primary, ${alpha(colors.white, 0.26)})`
                  : `0.6px solid var(--Divider-divider_primary, ${alpha(colors.grey[900], 0.26)})`,
            }),
            thumb: ({ theme }) => ({
              boxShadow: `0px 1px 2px 0px ${alpha('#101828', 0.15)}`,
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
              '& .MuiTabs-indicator': {
                backgroundColor: colors.blue.main,
              },
              minHeight: 44,
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
              paddingLeft: 1,
              paddingRight: 1,
              minWidth: 'auto',
              minHeight: 44,
              opacity: 1,
              color: theme.palette.text.secondary,
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
            clearIcon: <InputCloseIcon sx={{ width: 24, height: 24 }} />,
          },
          styleOverrides: {
            inputRoot: {
              minHeight: '44px',
              height: 'auto',
              padding: '0 !important',
              borderRadius: '6px',
              '& .MuiOutlinedInput-input': {
                padding: '10px 14px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                height: 'auto',
              },
            },
            input: {
              minHeight: '44px',
              padding: '10px 14px',
              boxSizing: 'border-box',
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
        // MUI X DatePicker components
        // @ts-expect-error - MUI X DatePicker component types may not be available
        MuiDatePicker: {
          defaultProps: {
            slots: {
              openPickerIcon: DatePickerIcon,
            },
            slotProps: {
              openPickerButton: {
                size: 'medium',
              },
              inputAdornment: {
                sx: { mx: '4px' },
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
                padding: '10px 14px',
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
              '& .MuiInputBase-input': {
                height: '44px',
                padding: '10px 14px',
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
            root: {
              height: '44px !important',
              borderRadius: '6px',
              '& .MuiOutlinedInput-input': {
                height: '44px',
                padding: '10px 14px',
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
            input: {
              height: '44px',
              padding: '10px 14px',
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
                  : colors.grey[100],
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
                    : colors.grey[100],
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
                    : colors.grey[100],
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
      },
    },
    overrideOptions,
  );
