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
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Issue, IssueStatus } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { SortableItem } from './sortable-item';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';
import type { IssueUpdateInput } from '@/lib/api';

const columns: { title: string; status: IssueStatus }[] = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'inProgress' },
  { title: 'Done', status: 'done' },
];

function DroppableColumn({
  column,
  issues,
  children
}: {
  column: { title: string; status: IssueStatus };
  issues: Issue[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-lg p-2 transition-all duration-200 ${
        isOver
          ? 'bg-primary/10 ring-2 ring-primary/30 shadow-lg scale-[1.02]'
          : 'bg-muted/50 hover:bg-muted/70'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-2 pt-1">
        <h3 className="font-semibold text-sm text-muted-foreground">
          {column.title}
        </h3>
        <span className="rounded-full bg-background px-2 py-1 text-xs font-medium">
          {issues.length}
        </span>
      </div>
      <div className={`space-y-2 min-h-[200px] rounded-md p-2 transition-colors ${
        isOver ? 'bg-background/50' : ''
      }`}>
        {children}
        {isOver && issues.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-primary/30 rounded-md">
            <p className="text-sm text-muted-foreground">Drop issue here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Define component props
interface KanbanBoardProps {
  issues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  onAddComment?: (issueId: string, content: string) => Promise<Issue>;
  onDeleteIssue?: (issueId: string) => Promise<void>;
  onUpdateIssue?: (issueId: string, updates: IssueUpdateInput) => Promise<Issue>;
}

// Accept issues and setIssues props
export function KanbanBoard({
  issues,
  setIssues,
  onAddComment,
  onDeleteIssue,
  onUpdateIssue,
}: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find(issue => issue.id === active.id);
    setActiveIssue(issue || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIndex = issues.findIndex(issue => issue.id === activeId);
    if (activeIndex === -1) {
      return;
    }

    const activeIssue = issues[activeIndex];
    const persistStatus = (status: IssueStatus) => {
      const previousIssues = issues;
      const nextIssues = issues.map((issue) =>
        issue.id === activeId ? { ...issue, status, updatedAt: new Date().toISOString() } : issue
      );
      setIssues(nextIssues);
      if (!onUpdateIssue) {
        return;
      }

      void onUpdateIssue(activeId, { status })
        .then((updatedIssue) => {
          setIssues((currentIssues) =>
            currentIssues.map((issue) => (issue.id === activeId ? updatedIssue : issue))
          );
        })
        .catch(() => {
          setIssues(previousIssues);
        });
    };

    // Check if we're dropping on a column
    const targetColumn = columns.find(col => col.status === overId);
    if (targetColumn) {
      // Moving to a different column
      if (activeIssue.status !== targetColumn.status) {
        persistStatus(targetColumn.status);
      }
      return;
    }

    // Check if we're dropping on another issue
    const overIndex = issues.findIndex(issue => issue.id === overId);
    if (overIndex !== -1) {
      const overIssue = issues[overIndex];
      if (!overIssue) {
        return;
      }

      // If moving to a different column
      if (activeIssue.status !== overIssue.status) {
        persistStatus(overIssue.status);
        return;
      }

      // Reordering within the same column
      if (activeIndex !== overIndex) {
        setIssues(arrayMove(issues, activeIndex, overIndex));
      }
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const handleUpdateIssue = (updatedIssue: Issue) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
    setSelectedIssue(updatedIssue);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => {
            const columnIssues = issues.filter((issue) => issue.status === column.status);
            const issueIds = columnIssues.map(issue => issue.id);

            return (
              <DroppableColumn key={column.status} column={column} issues={columnIssues}>
                <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
                  {columnIssues.map((issue) => (
                    <SortableItem
                      key={issue.id}
                      issue={issue}
                      onClick={handleIssueClick}
                    />
                  ))}
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
        {/* DragOverlay to render the item being dragged */}
        <DragOverlay>
          {activeIssue ? <SortableItem issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>

      <IssueDetailModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onAddComment={onAddComment}
        onClose={handleCloseModal}
        onDeleteIssue={onDeleteIssue}
        onUpdateIssue={handleUpdateIssue}
        onSaveIssue={onUpdateIssue}
      />
    </>
  );
}

// Export Issue type from here might cause issues if also defined in @/types
// Re-exporting from @/types is better if needed elsewhere
// export type { Issue };
