import { Button } from '@/components/ui/button';
import { LayoutGrid, ListTodo, Settings, Baseline as Timeline } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Project name
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban Board
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Timeline className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ListTodo className="mr-2 h-4 w-4" />
              Backlog
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Project settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}