import type { PhotoItem } from '../types';

/**
 * Calculate initial scale so the image fully covers the canvas (no empty space).
 */
export function calculateFitCoverScale(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number,
  rotation: number = 0
): number {
  // If rotated 90 or 270 degrees, swap the effective image dimensions
  const isRotated90 = Math.abs(rotation % 180) === 90;
  const effectiveW = isRotated90 ? imgH : imgW;
  const effectiveH = isRotated90 ? imgW : imgH;

  return Math.max(canvasW / effectiveW, canvasH / effectiveH);
}

/**
 * Render a photo onto a canvas context with all transforms applied.
 */
export function renderPhoto(
  ctx: CanvasRenderingContext2D,
  photo: PhotoItem,
  canvasW: number,
  canvasH: number,
  options?: { renderDimmed?: boolean; padding?: number }
): void {
  const { x, y, scale, rotation, flipH, flipV } = photo.transform;
  const padding = options?.padding ?? 0;

  // Clear the whole workspace (including padding)
  ctx.clearRect(0, 0, canvasW + padding * 2, canvasH + padding * 2);

  if (options?.renderDimmed) {
    // 1. Draw the full image dimmed (the "outside canvas" preview)
    ctx.save();
    ctx.globalAlpha = 0.3;
    // Move to center of the crop area (which is offset by padding)
    ctx.translate(padding + canvasW / 2 + x, padding + canvasH / 2 + y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      scale * (flipH ? -1 : 1),
      scale * (flipV ? -1 : 1)
    );
    ctx.drawImage(
      photo.imageElement,
      -photo.naturalWidth / 2,
      -photo.naturalHeight / 2
    );
    ctx.restore();

    // 2. Draw a semi-transparent dark overlay outside the crop area
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // Top
    ctx.fillRect(0, 0, canvasW + padding * 2, padding);
    // Bottom
    ctx.fillRect(0, canvasH + padding, canvasW + padding * 2, padding);
    // Left
    ctx.fillRect(0, padding, padding, canvasH);
    // Right
    ctx.fillRect(canvasW + padding, padding, padding, canvasH);
    ctx.restore();

    // 3. Draw the full-opacity image only inside the crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(padding, padding, canvasW, canvasH);
    ctx.clip();

    ctx.translate(padding + canvasW / 2 + x, padding + canvasH / 2 + y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      scale * (flipH ? -1 : 1),
      scale * (flipV ? -1 : 1)
    );
    ctx.drawImage(
      photo.imageElement,
      -photo.naturalWidth / 2,
      -photo.naturalHeight / 2
    );
    
    // Optional: Draw a thin border around the crop area
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, canvasW, canvasH);
  } else {
    // Standard render (for export — no padding, clipped to canvas)
    ctx.save();
    ctx.translate(canvasW / 2 + x, canvasH / 2 + y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      scale * (flipH ? -1 : 1),
      scale * (flipV ? -1 : 1)
    );
    ctx.drawImage(
      photo.imageElement,
      -photo.naturalWidth / 2,
      -photo.naturalHeight / 2
    );
    ctx.restore();
  }
}

/**
 * Render guide overlays (grid, center lines, rule of thirds) on a canvas.
 */
export function renderGuides(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  options: {
    showGrid: boolean;
    showCenterLines: boolean;
    showRuleOfThirds: boolean;
    padding?: number;
  }
): void {
  const padding = options.padding ?? 0;
  ctx.save();
  // Clip guides to crop area
  ctx.beginPath();
  ctx.rect(padding, padding, canvasW, canvasH);
  ctx.clip();

  if (options.showGrid) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    const cols = 12;
    const rows = 12;
    for (let i = 1; i < cols; i++) {
      const xPos = padding + (canvasW / cols) * i;
      ctx.beginPath();
      ctx.moveTo(xPos, padding);
      ctx.lineTo(xPos, padding + canvasH);
      ctx.stroke();
    }
    for (let i = 1; i < rows; i++) {
      const yPos = padding + (canvasH / rows) * i;
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(padding + canvasW, yPos);
      ctx.stroke();
    }
  }

  if (options.showRuleOfThirds) {
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const xPos = padding + (canvasW / 3) * i;
      ctx.beginPath();
      ctx.moveTo(xPos, padding);
      ctx.lineTo(xPos, padding + canvasH);
      ctx.stroke();

      const yPos = padding + (canvasH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(padding + canvasW, yPos);
      ctx.stroke();
    }
  }

  if (options.showCenterLines) {
    ctx.strokeStyle = 'rgba(0, 170, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(padding + canvasW / 2, padding);
    ctx.lineTo(padding + canvasW / 2, padding + canvasH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding + canvasH / 2);
    ctx.lineTo(padding + canvasW, padding + canvasH / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  ctx.restore();
}
