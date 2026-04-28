export interface PhotoTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export interface PhotoItem {
  id: string;
  file: File;
  objectURL: string;
  naturalWidth: number;
  naturalHeight: number;
  transform: PhotoTransform;
  imageElement: HTMLImageElement;
}

export interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'landscape' | 'portrait' | 'square' | 'print';
}

export type ExportFormat = 'jpeg' | 'png';
