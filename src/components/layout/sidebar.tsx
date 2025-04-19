import { Button } from '@/components/ui/button';
import { LayoutGrid, ListTodo, Settings, Baseline as Timeline } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const getVariant = (tabName: string) => {
    return activeTab === tabName ? 'secondary' : 'ghost';
  };

  // Define common classes for inactive buttons
  const inactiveClasses = "w-full justify-start text-primary-foreground dark:text-foreground";
  // Define common classes for active buttons
  const activeClasses = "w-full justify-start text-secondary-foreground";

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Project name
          </h2>
          <div className="space-y-1">
            <Button 
              variant={getVariant('board')} 
              className={activeTab === 'board' ? activeClasses : inactiveClasses}
              onClick={() => setActiveTab('board')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban Board
            </Button>
            <Button 
              variant={getVariant('timeline')} 
              className={activeTab === 'timeline' ? activeClasses : inactiveClasses}
              onClick={() => setActiveTab('timeline')}
            >
              <Timeline className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button 
              variant={getVariant('backlog')} 
              className={activeTab === 'backlog' ? activeClasses : inactiveClasses}
              onClick={() => setActiveTab('backlog')}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Backlog
            </Button>
            <Button 
              variant={getVariant('settings')} 
              className={activeTab === 'settings' ? activeClasses : inactiveClasses}
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