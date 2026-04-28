import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';
import type { PhotoItem } from '../../types';

interface SortableThumbnailProps {
  photo: PhotoItem;
  isActive: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onRemove: () => void;
}

function SortableThumbnail({ 
  photo, 
  isActive, 
  isSelected,
  onClick, 
  onRemove 
}: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        width: 80,
        height: 80,
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid',
        borderColor: isActive ? 'primary.main' : (isSelected ? 'rgba(124, 77, 255, 0.6)' : 'transparent'),
        boxShadow: isActive ? '0 0 10px rgba(124, 77, 255, 0.4)' : 'none',
        '&:hover .remove-btn': { opacity: 1 },
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
    >
      <Box
        {...attributes}
        {...listeners}
        component="img"
        src={photo.objectURL}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          userSelect: 'none',
        }}
      />
      
      {/* Selection Overlay */}
      {isSelected && !isActive && (
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          bgcolor: 'primary.main', 
          opacity: 0.2,
          pointerEvents: 'none'
        }} />
      )}

      <IconButton
        className="remove-btn"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          opacity: 0,
          p: 0.5,
          transition: 'opacity 0.2s',
          '&:hover': { bgcolor: 'error.main' },
        }}
      >
        <CloseIcon sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
}

export default function Carousel() {
  const { 
    photos, 
    activePhotoIndex, 
    selectedPhotoIds,
    setActivePhoto,
    reorderPhotos, 
    removePhoto,
    removePhotos,
    togglePhotoSelection,
  } = useAppStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // Global Delete/Backspace listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPhotoIds.length > 0) {
        // Prevent deletion if user is typing in an input
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable) {
          return;
        }
        removePhotos(selectedPhotoIds);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIds, removePhotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      reorderPhotos(oldIndex, newIndex);
    }
    setActiveId(null);
  };

  const handlePrev = () => {
    if (activePhotoIndex > 0) setActivePhoto(activePhotoIndex - 1);
  };

  const handleNext = () => {
    if (activePhotoIndex < photos.length - 1) setActivePhoto(activePhotoIndex + 1);
  };

  if (photos.length === 0) return null;

  const activeDragPhoto = photos.find(p => p.id === activeId);

  return (
    <Box
      sx={{
        height: 120,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 1.5,
      }}
    >
      <IconButton size="small" onClick={handlePrev} disabled={activePhotoIndex === 0}>
        <ChevronLeftIcon />
      </IconButton>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              py: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <SortableContext items={photos.map(p => p.id)} strategy={horizontalListSortingStrategy}>
              {photos.map((photo, index) => (
                <SortableThumbnail
                  key={photo.id}
                  photo={photo}
                  isActive={index === activePhotoIndex}
                  isSelected={selectedPhotoIds.includes(photo.id)}
                  onClick={(e) => togglePhotoSelection(photo.id, e.shiftKey, e.ctrlKey || e.metaKey)}
                  onRemove={() => removePhoto(photo.id)}
                />
              ))}
            </SortableContext>
          </Box>

          <DragOverlay>
            {activeId && activeDragPhoto ? (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  opacity: 0.8,
                  boxShadow: 8,
                }}
              >
                <img
                  src={activeDragPhoto.objectURL}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      <IconButton size="small" onClick={handleNext} disabled={activePhotoIndex >= photos.length - 1}>
        <ChevronRightIcon />
      </IconButton>

      <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'right', color: 'text.secondary' }}>
        {activePhotoIndex + 1} / {photos.length}
      </Typography>
    </Box>
  );
}
