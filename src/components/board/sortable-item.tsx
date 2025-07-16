import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import type { Issue } from '@/types';
import { useState, useRef } from 'react';

interface SortableItemProps {
  issue: Issue;
  onClick?: (issue: Issue) => void;
}

export function SortableItem({ issue, onClick }: SortableItemProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id: issue.id });

  const [isDragCandidate, setIsDragCandidate] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragCandidate(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartPos.current && onClick && !isDragging) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      
      // Only trigger click if mouse hasn't moved much (not a drag)
      if (deltaX < 5 && deltaY < 5) {
        onClick(issue);
      }
    }
    
    dragStartPos.current = null;
    setIsDragCandidate(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we're in a drag operation
    if (isDragging || isDragCandidate) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={`p-3 mb-3 cursor-pointer touch-none transition-all duration-200 bg-card border-border ${
        isDragging 
          ? 'opacity-50 rotate-2 shadow-xl scale-105 ring-2 ring-primary/30' 
          : 'hover:border-primary/50 hover:shadow-md hover:bg-accent/5'
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Drag handle area - only this area should have drag listeners */}
      <div 
        {...listeners}
        className="flex items-center gap-2 mb-2 cursor-grab active:cursor-grabbing"
      >
        <Badge variant="outline" className="text-xs">
          {issue.type}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {issue.priority}
        </Badge>
        <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground ml-auto opacity-60 hover:opacity-100 transition-opacity" /> 
      </div>
      
      {/* Clickable content area */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{issue.title}</h4>
        {issue.reporter && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={issue.reporter.avatarUrl} />
                <AvatarFallback>
                  {issue.reporter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 