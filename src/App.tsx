import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { KanbanBoard } from '@/components/board/kanban-board';
import type { Issue } from '@/types';
import { ProjectStats } from '@/components/dashboard/project-stats';
import { IssueForm } from '@/components/issues/issue-form';
import { ProjectSettings } from '@/components/settings/project-settings';
import { TimelinePage } from '@/components/timeline/timeline-page';
import { BacklogPage } from '@/components/backlog/backlog-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the type expected from the form
type CreateIssueData = Omit<Issue, 'id' | 'status' | 'reporter' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'labels' | 'assignee' | 'epic' | 'estimate'>;

function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [issues, setIssues] = useState<Issue[]>([]);

  // Function to add a new issue - expects data from the form
  const addIssue = (formData: CreateIssueData) => {
    // Create a full Issue object, adding default/generated values
    const newIssue: Issue = {
      ...formData, // Spread title, description, type, priority
      id: `ISS-${Math.random().toString(36).substring(2, 9)}`, 
      status: 'todo', // Default status
      // Add placeholder/default values for required fields not in the form
      reporter: { id: 'user-1', name: 'Current User', email: 'user@example.com', avatarUrl: '' }, // Placeholder reporter
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
      labels: [],
    };
    setIssues((prevIssues) => [...prevIssues, newIssue]);
    setActiveTab('board'); // Switch back to board after creating
  };

  return (
    <div className="min-h-screen">
      <Header setActiveTab={setActiveTab} />
      <div className="flex">
        <aside className="w-64 border-r">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="board" className="data-[state=inactive]:text-primary-foreground">Board</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=inactive]:text-primary-foreground">Timeline</TabsTrigger>
                <TabsTrigger value="backlog" className="data-[state=inactive]:text-primary-foreground">Backlog</TabsTrigger>
                <TabsTrigger value="create" className="data-[state=inactive]:text-primary-foreground">Create Issue</TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=inactive]:text-primary-foreground">Dashboard</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=inactive]:text-primary-foreground">Settings</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="board" className="m-0">
              <KanbanBoard issues={issues} setIssues={setIssues} />
            </TabsContent>
            <TabsContent value="timeline" className="m-0">
              <TimelinePage issues={issues} />
            </TabsContent>
            <TabsContent value="backlog" className="m-0">
              <BacklogPage issues={issues} />
            </TabsContent>
            <TabsContent value="create" className="m-0 max-w-2xl">
              <IssueForm addIssue={addIssue} />
            </TabsContent>
            <TabsContent value="dashboard" className="m-0">
              <ProjectStats issues={issues} />
            </TabsContent>
            <TabsContent value="settings" className="m-0">
              <ProjectSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default App;
