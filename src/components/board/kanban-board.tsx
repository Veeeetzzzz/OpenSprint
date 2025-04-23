import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  KeyboardSensor, 
  PointerSensor, 
  closestCenter, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Issue, IssueStatus } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { SortableItem } from './sortable-item';

// Remove mockIssues data
// const mockIssues: Issue[] = [ ... ];

// Define columns (could be moved or made dynamic later)
const columns: { title: string; status: IssueStatus }[] = [
  { title: 'To Do', status: 'todo' }, // Assuming 'todo' is a valid status
  { title: 'In Progress', status: 'inProgress' },
  { title: 'Done', status: 'done' },
];

// Define component props
interface KanbanBoardProps {
  issues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
}

// Accept issues and setIssues props
export function KanbanBoard({ issues, setIssues }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Define sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Find the index of an issue in the current list
  const findIssueIndex = (id: string) => issues.findIndex(issue => issue.id === id);

  // Find the status (column id) for a given issue id
  const findIssueStatus = (id: string) => issues.find(issue => issue.id === id)?.status;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find(issue => issue.id === active.id);
    setActiveIssue(issue || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null); // Clear active issue after drag ends

    if (over && active.id !== over.id) {
      setIssues((currentIssues) => {
        const activeIndex = findIssueIndex(active.id as string);
        const overId = over.id as string;
        
        // Find status of the container the item was dropped over
        // over.id could be a column status or another issue id
        let overStatus = findIssueStatus(overId);
        if (!overStatus) { // If over.id is not an issue, it might be a column id (status)
            const isColumn = columns.some(col => col.status === overId);
            if (isColumn) {
                overStatus = overId as IssueStatus;
            }
        }
        
        // If we couldn't determine the destination status, bail out
        if (!overStatus) return currentIssues; 

        const activeIssue = currentIssues[activeIndex];

        // If status changed or item moved within the same column
        if (activeIssue.status !== overStatus) {
          // Change status
          const updatedIssue = { ...activeIssue, status: overStatus };
          // Remove from old position, add to new status group (at the end for simplicity)
          const filteredIssues = currentIssues.filter(issue => issue.id !== active.id);
          // This simple approach doesn't handle reordering within the new column
          // A more complex logic would be needed to insert at the correct index based on over.id
          return [...filteredIssues, updatedIssue]; 
        } else {
          // Reorder within the same column
          const overIndex = findIssueIndex(overId);
          if (activeIndex !== overIndex) {
             return arrayMove(currentIssues, activeIndex, overIndex);
          }
        }
        return currentIssues; // Return unchanged if no move happened
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => {
          // Get issues for this column
          const columnIssues = issues.filter((issue) => issue.status === column.status);
          // Get just the IDs for SortableContext
          const issueIds = columnIssues.map(issue => issue.id);
          
          return (
            <div key={column.status} className="w-80 flex-shrink-0 bg-muted/50 rounded-lg p-2">
              <div className="mb-3 flex items-center justify-between px-2 pt-1">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {column.title}
                </h3>
                <span className="rounded-full bg-background px-2 py-1 text-xs">
                  {columnIssues.length}
                </span>
              </div>
              {/* Wrap items in SortableContext */}
              <SortableContext items={issueIds} strategy={rectSortingStrategy}>
                <div className="space-y-0 min-h-[50px]"> {/* Remove space-y-3, margin is on SortableItem */}
                  {columnIssues.map((issue) => (
                    <SortableItem key={issue.id} issue={issue} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      {/* DragOverlay to render the item being dragged */}
      <DragOverlay>
        {activeIssue ? <SortableItem issue={activeIssue} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Export Issue type from here might cause issues if also defined in @/types
// Re-exporting from @/types is better if needed elsewhere
// export type { Issue }; 