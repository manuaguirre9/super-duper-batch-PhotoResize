import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  ListSubheader,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAppStore } from '../../store/useAppStore';
import { RESOLUTION_PRESETS, CATEGORY_LABELS } from '../../utils/resolutionPresets';
import type { ResolutionPreset } from '../../types';

export default function ResolutionSelector() {
  const { canvasWidth, canvasHeight, setResolution } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [customW, setCustomW] = useState(canvasWidth.toString());
  const [customH, setCustomH] = useState(canvasHeight.toString());
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(canvasWidth / canvasHeight);

  const groupedPresets = useMemo(() => {
    const groups: Record<string, ResolutionPreset[]> = {};
    RESOLUTION_PRESETS.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, []);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value === 'custom') return;
    const preset = RESOLUTION_PRESETS.find(
      (p) => `${p.width}x${p.height}` === value
    );
    if (preset) {
      setCustomW(preset.width.toString());
      setCustomH(preset.height.toString());
      setAspectRatio(preset.width / preset.height);
      setResolution(preset.width, preset.height);
    }
  };

  const handleWidthChange = (val: string) => {
    setCustomW(val);
    setSelectedPreset('custom');
    const w = parseInt(val, 10);
    if (!isNaN(w) && w > 0) {
      if (lockAspect) {
        const h = Math.round(w / aspectRatio);
        setCustomH(h.toString());
        setResolution(w, h);
      } else {
        const h = parseInt(customH, 10);
        if (!isNaN(h) && h > 0) {
          setResolution(w, h);
        }
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setCustomH(val);
    setSelectedPreset('custom');
    const h = parseInt(val, 10);
    if (!isNaN(h) && h > 0) {
      if (lockAspect) {
        const w = Math.round(h * aspectRatio);
        setCustomW(w.toString());
        setResolution(w, h);
      } else {
        const w = parseInt(customW, 10);
        if (!isNaN(w) && w > 0) {
          setResolution(w, h);
        }
      }
    }
  };

  const handleToggleLock = () => {
    if (!lockAspect) {
      // Locking — capture current ratio
      const w = parseInt(customW, 10);
      const h = parseInt(customH, 10);
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        setAspectRatio(w / h);
      }
    }
    setLockAspect(!lockAspect);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField
        select
        size="small"
        value={selectedPreset}
        onChange={(e) => handlePresetChange(e.target.value)}
        sx={{ minWidth: 180 }}
        label="Preset"
      >
        <MenuItem value="custom">
          <em>Custom</em>
        </MenuItem>
        {Object.entries(groupedPresets).map(([category, presets]) => [
          <ListSubheader
            key={`header-${category}`}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.secondary',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              lineHeight: '28px',
            }}
          >
            {CATEGORY_LABELS[category as ResolutionPreset['category']]}
          </ListSubheader>,
          ...presets.map((p) => (
            <MenuItem key={`${p.width}x${p.height}`} value={`${p.width}x${p.height}`}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                <span>{p.label}</span>
                <Typography variant="caption" color="text.secondary">
                  {p.width}×{p.height} ({p.aspectRatio})
                </Typography>
              </Box>
            </MenuItem>
          )),
        ])}
      </TextField>

      <TextField
        size="small"
        type="number"
        value={customW}
        onChange={(e) => handleWidthChange(e.target.value)}
        sx={{ 
          width: 110,
          '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 }
        }}
        label="Width"
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: '0.75rem' } }}>px</InputAdornment>,
          },
          htmlInput: { min: 1, max: 10000 },
        }}
      />

      <Tooltip title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}>
        <IconButton size="small" onClick={handleToggleLock} color={lockAspect ? 'primary' : 'default'}>
          {lockAspect ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <TextField
        size="small"
        type="number"
        value={customH}
        onChange={(e) => handleHeightChange(e.target.value)}
        sx={{ 
          width: 110,
          '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 }
        }}
        label="Height"
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: '0.75rem' } }}>px</InputAdornment>,
          },
          htmlInput: { min: 1, max: 10000 },
        }}
      />
    </Box>
  );
}
