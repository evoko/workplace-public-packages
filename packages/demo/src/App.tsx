import React, { useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Typography,
  IconButton,
  Avatar,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { biampTheme } from '@workplace/styles';
import { Header } from '@workplace/components';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = biampTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Demo Header */}
        <Header
          title="Workplace"
          startContent={
            <IconButton color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
          }
          endContent={
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton color="inherit" aria-label="notifications">
                <NotificationsIcon />
              </IconButton>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            </Stack>
          }
        />

        {/* Demo Content */}
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Component Demo
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              This page demonstrates the shared Workplace components with the
              Biamp theme applied.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark mode"
              sx={{ mt: 1 }}
            />
          </Paper>

          {/* Header Variations */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Header Variations
          </Typography>

          <Stack spacing={3}>
            <Paper sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }}>
                Default Header
              </Typography>
              <Header title="Default Header" />
            </Paper>

            <Paper sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }}>
                Header with Start &amp; End Content
              </Typography>
              <Header
                title="My Application"
                startContent={
                  <IconButton color="inherit" size="small">
                    <MenuIcon />
                  </IconButton>
                }
                endContent={
                  <Stack direction="row" spacing={1}>
                    <Button color="inherit" size="small">
                      Help
                    </Button>
                    <Button color="inherit" variant="outlined" size="small">
                      Sign In
                    </Button>
                  </Stack>
                }
              />
            </Paper>

            <Paper sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }}>
                Header with Custom Color
              </Typography>
              <Header
                title="Custom Styled"
                appBarProps={{
                  color: 'transparent',
                  sx: {
                    bgcolor: 'grey.900',
                    color: 'common.white',
                  },
                }}
                endContent={
                  <Stack direction="row" spacing={1}>
                    <Chip label="v0.1.0" size="small" color="primary" />
                  </Stack>
                }
              />
            </Paper>

            <Paper sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1 }}>
                Minimal Header (no title)
              </Typography>
              <Header
                startContent={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    BIAMP
                  </Typography>
                }
                endContent={
                  <IconButton color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                }
              />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
