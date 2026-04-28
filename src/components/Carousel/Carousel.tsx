import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable'; // Often used as value
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';
import type { PhotoItem } from '../../types';

interface SortableThumbnailProps {
  photo: PhotoItem;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function SortableThumbnail({ photo, index, isActive, onClick }: SortableThumbnailProps) {
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
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        width: 56,
        height: 56,
        minWidth: 56,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'pointer',
        border: '2px solid',
        borderColor: isActive ? 'primary.main' : 'transparent',
        opacity: isActive ? 1 : 0.5,
        transition: 'all 0.15s ease',
        '&:hover': {
          opacity: 1,
          borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.2)',
        },
      }}
    >
      <img
        src={photo.objectURL}
        alt={photo.file.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none', // Important for drag
        }}
      />
    </Box>
  );
}

export default function Carousel() {
  const { photos, activePhotoIndex, setActivePhoto, reorderPhotos } = useAppStore();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid triggering drag on simple click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (photos.length === 0) return null;

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      reorderPhotos(oldIndex, newIndex);
    }
  };

  const handlePrev = () => {
    if (activePhotoIndex > 0) setActivePhoto(activePhotoIndex - 1);
  };

  const handleNext = () => {
    if (activePhotoIndex < photos.length - 1) setActivePhoto(activePhotoIndex + 1);
  };

  const activePhoto = photos.find(p => p.id === activeDragId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <IconButton
        size="small"
        onClick={handlePrev}
        disabled={activePhotoIndex === 0}
      >
        <ChevronLeftIcon />
      </IconButton>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            gap: 1,
            overflow: 'auto',
            py: 0.5,
            px: 0.5,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
            },
          }}
        >
          <SortableContext items={photos.map(p => p.id)} strategy={horizontalListSortingStrategy}>
            {photos.map((photo, i) => (
              <Tooltip key={photo.id} title={photo.file.name} placement="top">
                <div>
                  <SortableThumbnail
                    photo={photo}
                    index={i}
                    isActive={i === activePhotoIndex}
                    onClick={() => setActivePhoto(i)}
                  />
                </div>
              </Tooltip>
            ))}
          </SortableContext>
        </Box>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeDragId && activePhoto ? (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'primary.main',
                cursor: 'grabbing',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={activePhoto.objectURL}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <IconButton
        size="small"
        onClick={handleNext}
        disabled={activePhotoIndex >= photos.length - 1}
      >
        <ChevronRightIcon />
      </IconButton>

      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, textAlign: 'center' }}>
        {activePhotoIndex + 1} / {photos.length}
      </Typography>
    </Box>
  );
}
