import { useCallback, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppStore } from '../../store/useAppStore';

export default function EmptyState() {
  const addPhotos = useAppStore((s) => s.addPhotos);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) {
        await addPhotos(files);
      }
    },
    [addPhotos]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        await addPhotos(Array.from(files));
      }
    };
    input.click();
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        cursor: 'pointer',
        bgcolor: '#0A0A10',
        transition: 'all 0.2s ease',
        ...(isDragOver && {
          bgcolor: 'rgba(108, 99, 255, 0.05)',
        }),
      }}
    >
      <Box
        sx={{
          width: 280,
          height: 200,
          borderRadius: 3,
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : 'rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(108, 99, 255, 0.04)',
          },
        }}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: isDragOver ? 'primary.main' : 'text.secondary',
            transition: 'color 0.2s ease',
          }}
        />
        <Typography variant="body1" color="text.primary" fontWeight={500}>
          Drop photos here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
        Supports JPG, PNG, WebP, and more
      </Typography>
    </Box>
  );
}
