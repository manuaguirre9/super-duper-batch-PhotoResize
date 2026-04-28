import { useRef, useEffect, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { useAppStore } from '../../store/useAppStore';
import { renderPhoto, renderGuides } from '../../utils/canvas';

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    photos,
    activePhotoIndex,
    canvasWidth,
    canvasHeight,
    updateTransform,
    showGrid,
    showCenterLines,
    showRuleOfThirds,
  } = useAppStore();

  const activePhoto = photos[activePhotoIndex] ?? null;

  // Track display scale (canvas pixels -> CSS pixels)
  const [displayScale, setDisplayScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Calculate display scale to fit canvas in the container
  const updateDisplayScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const workspacePadding = 100; // px margin around the crop area in the canvas coordinate system
    const totalW = canvasWidth + workspacePadding * 2;
    const totalH = canvasHeight + workspacePadding * 2;

    const padding = 40; // UI padding
    const availW = container.clientWidth - padding * 2;
    const availH = container.clientHeight - padding * 2;
    const scale = Math.min(availW / totalW, availH / totalH, 1);
    setDisplayScale(scale);
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    updateDisplayScale();
    window.addEventListener('resize', updateDisplayScale);
    return () => window.removeEventListener('resize', updateDisplayScale);
  }, [updateDisplayScale]);

  // Render the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const workspacePadding = 100;
    canvas.width = canvasWidth + workspacePadding * 2;
    canvas.height = canvasHeight + workspacePadding * 2;

    // Fill background (workspace color)
    ctx.fillStyle = '#0A0A10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activePhoto) {
      renderPhoto(ctx, activePhoto, canvasWidth, canvasHeight, { 
        renderDimmed: true,
        padding: workspacePadding 
      });
    }

    // Guides on top
    renderGuides(ctx, canvasWidth, canvasHeight, {
      showGrid,
      showCenterLines,
      showRuleOfThirds,
      padding: workspacePadding
    });
  }, [activePhoto, canvasWidth, canvasHeight, showGrid, showCenterLines, showRuleOfThirds]);

  useEffect(() => {
    draw();
  }, [draw]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!activePhoto) return;

      switch (e.key) {
        case 'ArrowLeft':
          useAppStore.getState().setActivePhoto(Math.max(0, activePhotoIndex - 1));
          break;
        case 'ArrowRight':
          useAppStore.getState().setActivePhoto(Math.min(photos.length - 1, activePhotoIndex + 1));
          break;
        case '+':
        case '=':
          updateTransform(activePhoto.id, { scale: activePhoto.transform.scale * 1.1 });
          break;
        case '-':
        case '_':
          updateTransform(activePhoto.id, { scale: activePhoto.transform.scale / 1.1 });
          break;
        case 'r':
        case 'R':
          updateTransform(activePhoto.id, { rotation: activePhoto.transform.rotation + 90 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, activePhotoIndex, photos.length, updateTransform]);

  // --- Pan interaction ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activePhoto) return;
    setIsPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      tx: activePhoto.transform.x,
      ty: activePhoto.transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart.current || !activePhoto) return;
    const dx = (e.clientX - panStart.current.x) / displayScale;
    const dy = (e.clientY - panStart.current.y) / displayScale;
    updateTransform(activePhoto.id, {
      x: panStart.current.tx + dx,
      y: panStart.current.ty + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  // --- Zoom interaction (scroll wheel, zoom-to-pointer) ---
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (!activePhoto) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const workspacePadding = 100;
      const rect = canvas.getBoundingClientRect();
      // Mouse position in canvas coordinates
      const mouseX = (e.clientX - rect.left) / displayScale;
      const mouseY = (e.clientY - rect.top) / displayScale;

      // Only zoom if mouse is over the canvas area
      const { x, y, scale } = activePhoto.transform;
      const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newScale = Math.max(0.05, Math.min(scale * zoomFactor, 20));

      // Adjust pan to zoom toward pointer
      const canvasCenterX = workspacePadding + canvasWidth / 2;
      const canvasCenterY = workspacePadding + canvasHeight / 2;
      const pointerRelX = mouseX - canvasCenterX - x;
      const pointerRelY = mouseY - canvasCenterY - y;
      const scaleRatio = newScale / scale;

      updateTransform(activePhoto.id, {
        scale: newScale,
        x: x - pointerRelX * (scaleRatio - 1),
        y: y - pointerRelY * (scaleRatio - 1),
      });
    },
    [activePhoto, canvasWidth, canvasHeight, displayScale, updateTransform]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const workspacePadding = 100;
  const displayW = (canvasWidth + workspacePadding * 2) * displayScale;
  const displayH = (canvasHeight + workspacePadding * 2) * displayScale;

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#0A0A10',
        // Checkerboard pattern for transparency
        backgroundImage: `
          linear-gradient(45deg, #0E0E16 25%, transparent 25%),
          linear-gradient(-45deg, #0E0E16 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #0E0E16 75%),
          linear-gradient(-45deg, transparent 75%, #0E0E16 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: displayW,
          height: displayH,
          cursor: isPanning ? 'grabbing' : activePhoto ? 'grab' : 'default',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
          borderRadius: 2,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Canvas dimensions label */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          fontSize: '0.7rem',
          color: 'text.secondary',
          opacity: 0.6,
          userSelect: 'none',
        }}
      >
        {canvasWidth} × {canvasHeight}px · {Math.round(displayScale * 100)}%
      </Box>
    </Box>
  );
}
