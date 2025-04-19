import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { KanbanBoard } from '@/components/board/kanban-board';
import { ProjectStats } from '@/components/dashboard/project-stats';
import { IssueForm } from '@/components/issues/issue-form';
import { ProjectSettings } from '@/components/settings/project-settings';
import { TimelinePage } from '@/components/timeline/timeline-page';
import { BacklogPage } from '@/components/backlog/backlog-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div className="min-h-screen">
      <Header />
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
              <KanbanBoard />
            </TabsContent>
            <TabsContent value="timeline" className="m-0">
              <TimelinePage />
            </TabsContent>
            <TabsContent value="backlog" className="m-0">
              <BacklogPage />
            </TabsContent>
            <TabsContent value="create" className="m-0 max-w-2xl">
              <IssueForm />
            </TabsContent>
            <TabsContent value="dashboard" className="m-0">
              <ProjectStats />
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
