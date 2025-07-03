import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Layers, 
  Calendar,
  List,
  Plus,
  Settings,
  ChevronDown
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  projectId: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="h-screen flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">OpenSprint</h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <Collapsible open={isProjectOpen} onOpenChange={setIsProjectOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto p-3 text-left font-normal hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    OS
                  </div>
                  <div>
                    <div className="font-medium">OpenSprint Default</div>
                    <div className="text-xs text-muted-foreground">Software project</div>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProjectOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2 ml-4">
              <Link to={`/projects/${projectId}/board`}>
                <Button 
                  variant={isActive('/board') ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-2 h-9 text-sm font-normal"
                >
                  <Layers className="h-4 w-4" />
                  Kanban board
                </Button>
              </Link>
              
              <Link to={`/projects/${projectId}/timeline`}>
                <Button 
                  variant={isActive('/timeline') ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-2 h-9 text-sm font-normal"
                >
                  <Calendar className="h-4 w-4" />
                  Timeline
                </Button>
              </Link>
              
              <Link to={`/projects/${projectId}/backlog`}>
                <Button 
                  variant={isActive('/backlog') ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-2 h-9 text-sm font-normal"
                >
                  <List className="h-4 w-4" />
                  Backlog
                  <Badge variant="secondary" className="ml-auto text-xs">0</Badge>
                </Button>
              </Link>
              
              <Link to={`/projects/${projectId}/dashboard`}>
                <Button 
                  variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-2 h-9 text-sm font-normal"
                >
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <div className="p-2 border-t border-border mt-4">
          <Link to={`/projects/${projectId}/create`}>
            <Button 
              variant={isActive('/create') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2 h-9 text-sm font-normal"
            >
              <Plus className="h-4 w-4" />
              Create issue
            </Button>
          </Link>
          
          <Link to={`/projects/${projectId}/settings`}>
            <Button 
              variant={isActive('/settings') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2 h-9 text-sm font-normal"
            >
              <Settings className="h-4 w-4" />
              Project settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}