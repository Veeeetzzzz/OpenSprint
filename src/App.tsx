import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { KanbanBoard } from '@/components/board/kanban-board';
import type { Issue, Project } from '@/types';
import { ProjectStats } from '@/components/dashboard/project-stats';
import { IssueForm } from '@/components/issues/issue-form';
import { ProjectSettings } from '@/components/settings/project-settings';
import { TimelinePage } from '@/components/timeline/timeline-page';
import { BacklogPage } from '@/components/backlog/backlog-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AuthForm } from '@/components/auth/auth-form';
import {
  addIssueComment,
  createIssue,
  deleteIssue,
  getIssues,
  getProject,
  getProjects,
  type IssueCreateInput,
  type IssueUpdateInput,
  updateIssue,
} from '@/lib/api';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function LoadingView() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <button className="mt-3 text-sm underline" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function ProjectLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState('');

  const loadProjectData = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }

    setLoadState('loading');
    setError('');
    try {
      const [projectData, issueData] = await Promise.all([
        getProject(token, projectId),
        getIssues(token, projectId),
      ]);
      setProject(projectData);
      setIssues(issueData);
      setLoadState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      setLoadState('error');
    }
  }, [projectId, token]);

  useEffect(() => {
    void loadProjectData();
  }, [loadProjectData]);

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

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

  const addIssue = async (formData: IssueCreateInput) => {
    if (!token) {
      throw new Error('Authentication required');
    }
    const issue = await createIssue(token, projectId, formData);
    setIssues((prevIssues) => [issue, ...prevIssues]);
    navigate(`/projects/${projectId}/board`);
  };

  const saveIssue = async (issueId: string, updates: IssueUpdateInput) => {
    if (!token) {
      throw new Error('Authentication required');
    }
    const updated = await updateIssue(token, issueId, updates);
    setIssues((currentIssues) =>
      currentIssues.map((issue) => (issue.id === issueId ? updated : issue))
    );
    return updated;
  };

  const removeIssue = async (issueId: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }
    await deleteIssue(token, issueId);
    setIssues((currentIssues) => currentIssues.filter((issue) => issue.id !== issueId));
  };

  const addComment = async (issueId: string, content: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }
    const updated = await addIssueComment(token, issueId, content);
    setIssues((currentIssues) =>
      currentIssues.map((issue) => (issue.id === issueId ? updated : issue))
    );
    return updated;
  };

  if (loadState === 'loading' || loadState === 'idle') {
    return <LoadingView />;
  }

  if (loadState === 'error') {
    return <ErrorView message={error} onRetry={() => void loadProjectData()} />;
  }

  return (
    <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project?.name || 'Project'}</h1>
          {project?.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
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
        <Route
          path="board"
          element={
            <TabsContent value="board" className="m-0">
              <KanbanBoard
                issues={issues}
                setIssues={setIssues}
                onAddComment={addComment}
                onDeleteIssue={removeIssue}
                onUpdateIssue={saveIssue}
              />
            </TabsContent>
          }
        />
        <Route
          path="timeline"
          element={
            <TabsContent value="timeline" className="m-0">
              <TimelinePage issues={issues} />
            </TabsContent>
          }
        />
        <Route
          path="backlog"
          element={
            <TabsContent value="backlog" className="m-0">
              <BacklogPage issues={issues} />
            </TabsContent>
          }
        />
        <Route
          path="create"
          element={
            <TabsContent value="create" className="m-0 max-w-2xl">
              <IssueForm addIssue={addIssue} />
            </TabsContent>
          }
        />
        <Route
          path="dashboard"
          element={
            <TabsContent value="dashboard" className="m-0">
              <ProjectStats issues={issues} />
            </TabsContent>
          }
        />
        <Route
          path="settings"
          element={
            <TabsContent value="settings" className="m-0">
              <ProjectSettings />
            </TabsContent>
          }
        />
        <Route index element={<Navigate to="board" replace />} />
      </Routes>
    </Tabs>
  );
}

function ProjectsOverview({
  projects,
  isLoading,
  error,
  onRetry,
}: {
  projects: Project[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">Workspaces you can access</p>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No projects found. Create one through the API or enable demo mode with seeded data.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="rounded-lg border p-6 text-left transition-shadow hover:shadow-md"
              onClick={() => navigate(`/projects/${project.id}/board`)}
            >
              <h3 className="mb-2 text-xl font-semibold">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.description || project.key}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function YourWork() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Work</h1>
        <p className="text-muted-foreground">Quick access to your assigned issues and recent activity</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Issues</h3>
          <p className="text-muted-foreground">No recent issues found</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Assigned to You</h3>
          <p className="text-muted-foreground">No issues assigned</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

function HomeRedirect({ projects, isLoading }: { projects: Project[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingView />;
  }

  if (projects.length > 0) {
    return <Navigate to={`/projects/${projects[0].id}/board`} replace />;
  }

  return <Navigate to="/projects" replace />;
}

function AuthenticatedApp() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  const loadProjects = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingProjects(true);
    setProjectsError('');
    try {
      setProjects(await getProjects(token));
    } catch (err) {
      setProjectsError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header projects={projects} />
      <div className="flex bg-background">
        <aside className="w-64 shrink-0 bg-card">
          <Sidebar projects={projects} />
        </aside>
        <main className="min-w-0 flex-1 overflow-auto bg-background p-6">
          <Routes>
            <Route
              path="/"
              element={<HomeRedirect projects={projects} isLoading={isLoadingProjects} />}
            />
            <Route path="/your-work" element={<YourWork />} />
            <Route
              path="/projects"
              element={
                <ProjectsOverview
                  projects={projects}
                  isLoading={isLoadingProjects}
                  error={projectsError}
                  onRetry={() => void loadProjects()}
                />
              }
            />
            <Route path="/projects/:projectId/*" element={<ProjectLayout />} />
            <Route
              path="/filters"
              element={
                <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                  <h1 className="text-2xl">Filters - Coming Soon</h1>
                </div>
              }
            />
            <Route
              path="/dashboards"
              element={
                <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                  <h1 className="text-2xl">Dashboards - Coming Soon</h1>
                </div>
              }
            />
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
