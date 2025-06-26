import { Button } from '@/components/ui/button';
import { LayoutGrid, ListTodo, Settings, Baseline as Timeline } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="pb-12 min-h-screen bg-card border-r border-border">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-card-foreground">
            Project name
          </h2>
          <div className="space-y-1">
            <Button 
              variant="ghost"
              className={`w-full justify-start text-card-foreground hover:bg-accent hover:text-accent-foreground ${
                activeTab === 'board' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-transparent'
              }`}
              onClick={() => setActiveTab('board')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban Board
            </Button>
            <Button 
              variant="ghost"
              className={`w-full justify-start text-card-foreground hover:bg-accent hover:text-accent-foreground ${
                activeTab === 'timeline' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-transparent'
              }`}
              onClick={() => setActiveTab('timeline')}
            >
              <Timeline className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button 
              variant="ghost"
              className={`w-full justify-start text-card-foreground hover:bg-accent hover:text-accent-foreground ${
                activeTab === 'backlog' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-transparent'
              }`}
              onClick={() => setActiveTab('backlog')}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Backlog
            </Button>
            <Button 
              variant="ghost"
              className={`w-full justify-start text-card-foreground hover:bg-accent hover:text-accent-foreground ${
                activeTab === 'settings' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-transparent'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Project settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}