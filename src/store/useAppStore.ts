import { create } from 'zustand';
import type { PhotoItem, PhotoTransform, ExportFormat } from '../types';
import { calculateFitCoverScale } from '../utils/canvas';

interface AppState {
  // Resolution
  canvasWidth: number;
  canvasHeight: number;
  setResolution: (w: number, h: number) => void;

  // Photos
  photos: PhotoItem[];
  activePhotoIndex: number;
  addPhotos: (files: File[]) => Promise<void>;
  removePhoto: (id: string) => void;
  reorderPhotos: (oldIndex: number, newIndex: number) => void;
  setActivePhoto: (index: number) => void;
  updateTransform: (id: string, partial: Partial<PhotoTransform>) => void;
  resetTransform: (id: string) => void;

  // Export
  exportFormat: ExportFormat;
  exportQuality: number;
  setExportFormat: (format: ExportFormat) => void;
  setExportQuality: (quality: number) => void;

  // Guides
  showGrid: boolean;
  showCenterLines: boolean;
  showRuleOfThirds: boolean;
  toggleGrid: () => void;
  toggleCenterLines: () => void;
  toggleRuleOfThirds: () => void;

  // Export progress
  isExporting: boolean;
  exportProgress: { current: number; total: number } | null;
  setExporting: (exporting: boolean) => void;
  setExportProgress: (progress: { current: number; total: number } | null) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
}

function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  // Resolution — default Full HD
  canvasWidth: 1920,
  canvasHeight: 1080,
  setResolution: (w, h) => {
    set({ canvasWidth: w, canvasHeight: h });
    // Recalculate fit-cover for all existing photos
    const { photos } = get();
    if (photos.length > 0) {
      const updated = photos.map((photo) => ({
        ...photo,
        transform: {
          x: 0,
          y: 0,
          scale: calculateFitCoverScale(photo.naturalWidth, photo.naturalHeight, w, h),
          rotation: 0,
          flipH: false,
          flipV: false,
        },
      }));
      set({ photos: updated });
    }
  },

  // Photos
  photos: [],
  activePhotoIndex: 0,

  addPhotos: async (files) => {
    const { canvasWidth, canvasHeight, photos } = get();
    const newPhotos: PhotoItem[] = [];

    for (const file of files) {
      try {
        const { img, url } = await loadImage(file);
        const scale = calculateFitCoverScale(
          img.naturalWidth,
          img.naturalHeight,
          canvasWidth,
          canvasHeight
        );
        newPhotos.push({
          id: crypto.randomUUID(),
          file,
          objectURL: url,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          imageElement: img,
          transform: {
            x: 0,
            y: 0,
            scale,
            rotation: 0,
            flipH: false,
            flipV: false,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    const allPhotos = [...photos, ...newPhotos];
    set({
      photos: allPhotos,
      activePhotoIndex: photos.length > 0 ? get().activePhotoIndex : 0,
    });
  },

  reorderPhotos: (oldIndex, newIndex) => {
    set((state) => {
      const newPhotos = [...state.photos];
      const [movedPhoto] = newPhotos.splice(oldIndex, 1);
      newPhotos.splice(newIndex, 0, movedPhoto);
      
      // Update activePhotoIndex if the active photo was moved or affected
      let newActiveIndex = state.activePhotoIndex;
      if (state.activePhotoIndex === oldIndex) {
        newActiveIndex = newIndex;
      } else if (state.activePhotoIndex > oldIndex && state.activePhotoIndex <= newIndex) {
        newActiveIndex--;
      } else if (state.activePhotoIndex < oldIndex && state.activePhotoIndex >= newIndex) {
        newActiveIndex++;
      }

      return { photos: newPhotos, activePhotoIndex: newActiveIndex };
    });
  },

  removePhoto: (id) => {
    const { photos, activePhotoIndex } = get();
    const idx = photos.findIndex((p) => p.id === id);
    if (idx === -1) return;

    // Revoke object URL
    URL.revokeObjectURL(photos[idx].objectURL);

    const newPhotos = photos.filter((p) => p.id !== id);
    let newIndex = activePhotoIndex;
    if (newPhotos.length === 0) {
      newIndex = 0;
    } else if (activePhotoIndex >= newPhotos.length) {
      newIndex = newPhotos.length - 1;
    }
    set({ photos: newPhotos, activePhotoIndex: newIndex });
  },

  setActivePhoto: (index) => {
    const { photos } = get();
    if (index >= 0 && index < photos.length) {
      set({ activePhotoIndex: index });
    }
  },

  updateTransform: (id, partial) => {
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, transform: { ...p.transform, ...partial } } : p
      ),
    }));
  },

  resetTransform: (id) => {
    const { canvasWidth, canvasHeight } = get();
    set((state) => ({
      photos: state.photos.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          transform: {
            x: 0,
            y: 0,
            scale: calculateFitCoverScale(p.naturalWidth, p.naturalHeight, canvasWidth, canvasHeight),
            rotation: 0,
            flipH: false,
            flipV: false,
          },
        };
      }),
    }));
  },

  // Export
  exportFormat: 'jpeg',
  exportQuality: 1.0,
  setExportFormat: (format) => set({ exportFormat: format }),
  setExportQuality: (quality) => set({ exportQuality: quality }),

  // Guides
  showGrid: false,
  showCenterLines: false,
  showRuleOfThirds: false,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleCenterLines: () => set((s) => ({ showCenterLines: !s.showCenterLines })),
  toggleRuleOfThirds: () => set((s) => ({ showRuleOfThirds: !s.showRuleOfThirds })),

  // Export progress
  isExporting: false,
  exportProgress: null,
  setExporting: (exporting) => set({ isExporting: exporting }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  
  notification: null,
  setNotification: (notification) => set({ notification }),
}));
