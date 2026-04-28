import {
  Box,
  IconButton,
  Slider,
  Tooltip,
  Divider,
  ToggleButton,
  Typography,
} from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GridOnIcon from '@mui/icons-material/GridOn';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppStore } from '../../store/useAppStore';

export default function Toolbar() {
  const {
    photos,
    activePhotoIndex,
    updateTransform,
    resetTransform,
    removePhoto,
    showGrid,
    showCenterLines,
    showRuleOfThirds,
    toggleGrid,
    toggleCenterLines,
    toggleRuleOfThirds,
  } = useAppStore();

  const photo = photos[activePhotoIndex] ?? null;
  const disabled = !photo;

  const handleRotate = (deg: number) => {
    if (!photo) return;
    updateTransform(photo.id, { rotation: photo.transform.rotation + deg });
  };

  const handleFlipH = () => {
    if (!photo) return;
    updateTransform(photo.id, { flipH: !photo.transform.flipH });
  };

  const handleFlipV = () => {
    if (!photo) return;
    updateTransform(photo.id, { flipV: !photo.transform.flipV });
  };

  const handleZoomChange = (_: unknown, value: number | number[]) => {
    if (!photo) return;
    updateTransform(photo.id, { scale: value as number });
  };

  const handleZoomStep = (factor: number) => {
    if (!photo) return;
    const newScale = Math.max(0.05, Math.min(photo.transform.scale * factor, 20));
    updateTransform(photo.id, { scale: newScale });
  };

  const handleReset = () => {
    if (!photo) return;
    resetTransform(photo.id);
  };

  const handleRemove = () => {
    if (!photo) return;
    removePhoto(photo.id);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {/* Zoom controls */}
      <Tooltip title="Zoom out">
        <span>
          <IconButton size="small" disabled={disabled} onClick={() => handleZoomStep(1 / 1.2)}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Slider
        value={photo?.transform.scale ?? 1}
        onChange={handleZoomChange}
        min={0.05}
        max={5}
        step={0.01}
        disabled={disabled}
        size="small"
        sx={{ width: 120 }}
      />

      <Tooltip title="Zoom in">
        <span>
          <IconButton size="small" disabled={disabled} onClick={() => handleZoomStep(1.2)}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {photo && (
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 42, textAlign: 'center' }}>
          {Math.round(photo.transform.scale * 100)}%
        </Typography>
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Rotate */}
      <Tooltip title="Rotate left 90°">
        <span>
          <IconButton size="small" disabled={disabled} onClick={() => handleRotate(-90)}>
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Rotate right 90°">
        <span>
          <IconButton size="small" disabled={disabled} onClick={() => handleRotate(90)}>
            <RotateRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Flip */}
      <Tooltip title="Flip horizontal">
        <span>
          <IconButton size="small" disabled={disabled} onClick={handleFlipH}>
            <FlipIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Flip vertical">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={handleFlipV}
            sx={{ transform: 'rotate(90deg)' }}
          >
            <FlipIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Guides */}
      <Tooltip title="Grid">
        <ToggleButton
          value="grid"
          selected={showGrid}
          onChange={toggleGrid}
          size="small"
          sx={{ border: 'none', borderRadius: 1, p: 0.75 }}
        >
          <GridOnIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Center lines">
        <ToggleButton
          value="center"
          selected={showCenterLines}
          onChange={toggleCenterLines}
          size="small"
          sx={{ border: 'none', borderRadius: 1, p: 0.75 }}
        >
          <VerticalAlignCenterIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Rule of thirds">
        <ToggleButton
          value="thirds"
          selected={showRuleOfThirds}
          onChange={toggleRuleOfThirds}
          size="small"
          sx={{ border: 'none', borderRadius: 1, p: 0.75 }}
        >
          <Grid3x3Icon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Reset & Remove */}
      <Tooltip title="Reset adjustments">
        <span>
          <IconButton size="small" disabled={disabled} onClick={handleReset}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove photo">
        <span>
          <IconButton size="small" disabled={disabled} onClick={handleRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
