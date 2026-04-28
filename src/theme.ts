import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
      light: '#8B83FF',
      dark: '#4A42CC',
    },
    secondary: {
      main: '#FF6B9D',
      light: '#FF8FB5',
      dark: '#CC4F7D',
    },
    background: {
      default: '#0D0D12',
      paper: '#16161F',
    },
    surface: undefined,
    text: {
      primary: '#E8E8ED',
      secondary: '#9494A8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body2: {
      color: '#9494A8',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(108, 99, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E1E2E',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.75rem',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 4,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
