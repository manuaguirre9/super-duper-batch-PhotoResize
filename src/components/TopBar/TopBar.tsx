import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import CropIcon from '@mui/icons-material/Crop';
import ResolutionSelector from './ResolutionSelector';
import ImportButton from './ImportButton';
import ExportPanel from './ExportPanel';

export default function TopBar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '56px !important' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
          <CropIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PhotoResize
          </Typography>
        </Box>

        {/* Resolution */}
        <ResolutionSelector />

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <ImportButton />
        <ExportPanel />
      </Toolbar>
    </AppBar>
  );
}
