import { useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AuthForm } from '@/components/auth/auth-form';

// Define the type expected from the form
type CreateIssueData = Omit<Issue, 'id' | 'status' | 'reporter' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'labels' | 'assignee' | 'epic' | 'estimate'>;

// Project wrapper component that handles the main project views
function ProjectLayout() {
  const { projectId = 'default' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [issues, setIssues] = useState<Issue[]>([]);

  // Get current tab from URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/board')) return 'board';
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/backlog')) return 'backlog';
    if (path.includes('/create')) return 'create';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/settings')) return 'settings';
    return 'board';
  };

  const handleTabChange = (tab: string) => {
    navigate(`/projects/${projectId}/${tab}`);
  };

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
    navigate(`/projects/${projectId}/board`); // Navigate back to board after creating
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex bg-background">
        <aside className="w-64 bg-card">
          <Sidebar projectId={projectId} />
        </aside>
        <main className="flex-1 p-6 overflow-auto bg-background">
          <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted">
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="backlog">Backlog</TabsTrigger>
                <TabsTrigger value="create">Create Issue</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
            <Routes>
              <Route path="board" element={
                <TabsContent value="board" className="m-0">
                  <KanbanBoard issues={issues} setIssues={setIssues} />
                </TabsContent>
              } />
              <Route path="timeline" element={
                <TabsContent value="timeline" className="m-0">
                  <TimelinePage issues={issues} />
                </TabsContent>
              } />
              <Route path="backlog" element={
                <TabsContent value="backlog" className="m-0">
                  <BacklogPage issues={issues} />
                </TabsContent>
              } />
              <Route path="create" element={
                <TabsContent value="create" className="m-0 max-w-2xl">
                  <IssueForm addIssue={addIssue} />
                </TabsContent>
              } />
              <Route path="dashboard" element={
                <TabsContent value="dashboard" className="m-0">
                  <ProjectStats issues={issues} />
                </TabsContent>
              } />
              <Route path="settings" element={
                <TabsContent value="settings" className="m-0">
                  <ProjectSettings />
                </TabsContent>
              } />
              <Route index element={<Navigate to="board" replace />} />
            </Routes>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Projects overview component (placeholder for now)
function ProjectsOverview() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex bg-background">
        <main className="flex-1 p-6 overflow-auto bg-background">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Projects</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => window.location.href = '/projects/default'}>
                <h3 className="text-xl font-semibold mb-2">OpenSprint Default</h3>
                <p className="text-muted-foreground">Your main project workspace</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main dashboard component (Your Work)
function YourWork() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex bg-background">
        <main className="flex-1 p-6 overflow-auto bg-background">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Your Work</h1>
            <p className="text-muted-foreground">Quick access to your assigned issues and recent activity</p>
            {/* Placeholder content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Issues</h3>
                <p className="text-muted-foreground">No recent issues found</p>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Assigned to You</h3>
                <p className="text-muted-foreground">No issues assigned</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

// Main authenticated app layout
function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/projects/default" replace />} />
            <Route path="/your-work" element={<YourWork />} />
            <Route path="/projects" element={<ProjectsOverview />} />
            <Route path="/projects/:projectId/*" element={<ProjectLayout />} />
            <Route path="/filters" element={<div className="min-h-screen bg-background text-foreground flex items-center justify-center"><h1 className="text-2xl">Filters - Coming Soon</h1></div>} />
            <Route path="/dashboards" element={<div className="min-h-screen bg-background text-foreground flex items-center justify-center"><h1 className="text-2xl">Dashboards - Coming Soon</h1></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AuthenticatedApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
