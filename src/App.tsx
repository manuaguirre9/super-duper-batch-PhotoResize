import { Box, CssBaseline, ThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import TopBar from './components/TopBar/TopBar';
import CanvasEditor from './components/Editor/CanvasEditor';
import Toolbar from './components/Editor/Toolbar';
import Carousel from './components/Carousel/Carousel';
import EmptyState from './components/EmptyState/EmptyState';
import { useAppStore } from './store/useAppStore';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C4DFF', // Vibrant purple
    },
    background: {
      default: '#050508',
      paper: '#12121A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const photos = useAppStore((state) => state.photos);
  const notification = useAppStore((state) => state.notification);
  const setNotification = useAppStore((state) => state.setNotification);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {photos.length > 0 ? (
            <>
              <CanvasEditor />
              <Toolbar />
              <Carousel />
            </>
          ) : (
            <EmptyState />
          )}
        </Box>
      </Box>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.type} 
            variant="filled"
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
