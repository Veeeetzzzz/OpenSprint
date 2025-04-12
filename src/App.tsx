import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { KanbanBoard } from '@/components/board/kanban-board';
import { ProjectStats } from '@/components/dashboard/project-stats';
import { IssueForm } from '@/components/issues/issue-form';
import { ProjectSettings } from '@/components/settings/project-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <aside className="w-64 border-r">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="board" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="create">Create Issue</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="board" className="m-0">
              <KanbanBoard />
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
