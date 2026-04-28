import { useState } from 'react';
import {
  Button,
  Popover,
  Box,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useAppStore } from '../../store/useAppStore';
import { exportAllPhotos } from '../../utils/export';
import type { ExportFormat } from '../../types';

export default function ExportPanel() {
  const {
    photos,
    canvasWidth,
    canvasHeight,
    exportFormat,
    exportQuality,
    setExportFormat,
    setExportQuality,
    isExporting,
    exportProgress,
    setExporting,
    setExportProgress,
  } = useAppStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleExport = async () => {
    if (photos.length === 0) return;
    setAnchorEl(null);
    setExporting(true);

    try {
      await exportAllPhotos(
        photos,
        canvasWidth,
        canvasHeight,
        exportFormat,
        exportQuality,
        (current, total) => setExportProgress({ current, total })
      );
      useAppStore.getState().setNotification({
        message: `Successfully exported ${photos.length} photos!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={photos.length === 0 || isExporting}
        size="small"
      >
        {isExporting && exportProgress
          ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
          : `Export${photos.length > 0 ? ` (${photos.length})` : ''}`}
      </Button>

      {isExporting && exportProgress && (
        <LinearProgress
          variant="determinate"
          value={(exportProgress.current / exportProgress.total) * 100}
          sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 }}
        />
      )}

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { p: 2.5, minWidth: 260, bgcolor: 'background.paper', mt: 1 },
          },
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 600 }}>
          FORMAT
        </Typography>
        <ToggleButtonGroup
          value={exportFormat}
          exclusive
          onChange={(_, v) => v && setExportFormat(v as ExportFormat)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="jpeg">JPEG</ToggleButton>
          <ToggleButton value="png">PNG</ToggleButton>
        </ToggleButtonGroup>

        {exportFormat === 'jpeg' && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
              QUALITY — {Math.round(exportQuality * 100)}%
            </Typography>
            <Slider
              value={exportQuality}
              onChange={(_, v) => setExportQuality(v as number)}
              min={0.1}
              max={1}
              step={0.01}
              size="small"
              sx={{ mb: 2 }}
            />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleExport}
            startIcon={<DownloadIcon />}
          >
            Export All
          </Button>
        </Box>
      </Popover>
    </>
  );
}
