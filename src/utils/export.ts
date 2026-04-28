import type { PhotoItem, ExportFormat } from '../types';
import { renderPhoto } from './canvas';

/**
 * Export a single photo to a Blob at the target resolution.
 */
export async function exportPhoto(
  photo: PhotoItem,
  canvasWidth: number,
  canvasHeight: number,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  renderPhoto(ctx, photo, canvasWidth, canvasHeight, { renderDimmed: false });

  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const q = format === 'jpeg' ? quality : undefined;

    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      mimeType,
      q
    );
  });
}

/**
 * Generate the output filename from the original file.
 */
export function getExportFilename(originalName: string, format: ExportFormat): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  return `${baseName}_cropped.${ext}`;
}

/**
 * Trigger a browser download for a blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all photos sequentially. Supports direct saving to a directory handle.
 */
export async function exportAllPhotos(
  photos: PhotoItem[],
  canvasWidth: number,
  canvasHeight: number,
  format: ExportFormat,
  quality: number,
  onProgress?: (current: number, total: number) => void,
  directoryHandle?: FileSystemDirectoryHandle
): Promise<void> {
  const total = photos.length;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    onProgress?.(i + 1, total);

    const blob = await exportPhoto(photo, canvasWidth, canvasHeight, format, quality);
    const filename = getExportFilename(photo.file.name, format);

    if (directoryHandle) {
      try {
        const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        console.error(`Failed to save ${filename} to directory, falling back to download:`, err);
        downloadBlob(blob, filename);
      }
    } else {
      downloadBlob(blob, filename);
    }

    // Delay between photos to keep UI smooth and respect browser limits
    if (i < total - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}
