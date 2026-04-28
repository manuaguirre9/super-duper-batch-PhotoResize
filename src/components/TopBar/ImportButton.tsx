import { useRef } from 'react';
import { Button } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useAppStore } from '../../store/useAppStore';

export default function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addPhotos = useAppStore((s) => s.addPhotos);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await addPhotos(Array.from(files));
    // Reset input so the same files can be re-selected
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="outlined"
        startIcon={<AddPhotoAlternateIcon />}
        onClick={handleClick}
        size="small"
      >
        Import
      </Button>
    </>
  );
}
