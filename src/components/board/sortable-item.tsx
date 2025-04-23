import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import type { Issue } from '@/types';

interface SortableItemProps {
  issue: Issue;
}

export function SortableItem({ issue }: SortableItemProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} // Spread listeners to make the whole card draggable
      className="p-3 mb-3 cursor-grab touch-none hover:border-primary/50 active:cursor-grabbing"
    >
       <div className="flex items-center gap-2 mb-2">
         <Badge variant="outline" className="text-xs pointer-events-none">
           {issue.type}
         </Badge>
         <Badge variant="secondary" className="text-xs pointer-events-none">
           {issue.priority}
         </Badge>
         {/* Optionally make only the handle draggable: move listeners here and remove from Card */}
         <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground ml-auto" /> 
       </div>
       <h4 className="text-sm font-medium mb-2 pointer-events-none">{issue.title}</h4>
       {issue.reporter && (
         <div className="flex items-center justify-between pointer-events-none">
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
    </Card>
  );
} 