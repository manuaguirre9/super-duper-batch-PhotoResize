import type { ResolutionPreset } from '../types';

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  // Square
  { label: 'Square', width: 1080, height: 1080, aspectRatio: '1:1', category: 'square' },

  // Landscape
  { label: 'HD (720p)', width: 1280, height: 720, aspectRatio: '16:9', category: 'landscape' },
  { label: 'Full HD (1080p)', width: 1920, height: 1080, aspectRatio: '16:9', category: 'landscape' },
  { label: '2K (QHD)', width: 2560, height: 1440, aspectRatio: '16:9', category: 'landscape' },
  { label: '4K (UHD)', width: 3840, height: 2160, aspectRatio: '16:9', category: 'landscape' },
  { label: 'Classic 4:3', width: 1440, height: 1080, aspectRatio: '4:3', category: 'landscape' },
  { label: 'Ultrawide', width: 3440, height: 1440, aspectRatio: '21:9', category: 'landscape' },
  { label: 'Cinema 21:9', width: 2560, height: 1080, aspectRatio: '21:9', category: 'landscape' },

  // Portrait
  { label: 'Portrait 2:3', width: 1080, height: 1620, aspectRatio: '2:3', category: 'portrait' },
  { label: 'Portrait 3:4', width: 1080, height: 1440, aspectRatio: '3:4', category: 'portrait' },
  { label: 'Portrait 9:16', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait' },

  // Print
  { label: 'A4 (300 DPI)', width: 2480, height: 3508, aspectRatio: '~1:1.41', category: 'print' },
  { label: 'Letter (300 DPI)', width: 2550, height: 3300, aspectRatio: '~1:1.29', category: 'print' },
];

export const CATEGORY_LABELS: Record<ResolutionPreset['category'], string> = {
  square: 'Square',
  landscape: 'Landscape',
  portrait: 'Portrait',
  print: 'Print',
};
