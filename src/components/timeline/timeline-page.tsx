import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import type { Issue } from '@/types';

interface TimelinePageProps {
  issues?: Issue[];
}

// Mock data for timeline - used as fallback when no issues are passed
const mockTimelineIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Setup project structure',
    description: 'Initialize the project with proper folder structure and dependencies',
    type: 'task',
    status: 'done',
    priority: 'high',
    reporter: { 
      id: 'user-1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-16T14:30:00Z'),
    comments: [],
    attachments: [],
    labels: ['setup', 'infrastructure']
  },
  {
    id: 'ISS-002',
    title: 'Design user authentication flow',
    description: 'Create wireframes and user flows for the authentication system',
    type: 'story',
    status: 'inProgress',
    priority: 'medium',
    reporter: { 
      id: 'user-2', 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-17T16:00:00Z'),
    comments: [],
    attachments: [],
    labels: ['design', 'auth']
  },
  {
    id: 'ISS-003',
    title: 'Fix login button styling',
    description: 'The login button is not aligned properly on mobile devices',
    type: 'bug',
    status: 'todo',
    priority: 'low',
    reporter: { 
      id: 'user-3', 
      name: 'Bob Wilson', 
      email: 'bob@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-17T11:30:00Z'),
    updatedAt: new Date('2024-01-17T11:30:00Z'),
    comments: [],
    attachments: [],
    labels: ['ui', 'mobile']
  }
];

// Helper function to get status color
const getStatusColor = (status: Issue['status']) => {
  switch (status) {
    case 'done':
      return 'bg-green-500';
    case 'inProgress':
      return 'bg-blue-500';
    case 'todo':
      return 'bg-yellow-500';
    case 'backlog':
      return 'bg-gray-500';
    case 'selected':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to get status text
const getStatusText = (status: Issue['status']) => {
  switch (status) {
    case 'done':
      return 'Completed';
    case 'inProgress':
      return 'In Progress';
    case 'todo':
      return 'To Do';
    case 'backlog':
      return 'Backlog';
    case 'selected':
      return 'Selected';
    default:
      return status;
  }
};

// Helper function to get type icon
const getTypeColor = (type: Issue['type']) => {
  switch (type) {
    case 'story':
      return 'bg-green-100 text-green-800';
    case 'task':
      return 'bg-blue-100 text-blue-800';
    case 'bug':
      return 'bg-red-100 text-red-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export function TimelinePage({ issues = [] }: TimelinePageProps) {
  // Use passed issues or fallback to mock data
  const timelineIssues = issues.length > 0 ? issues : mockTimelineIssues;
  
  // Sort issues by creation date (newest first)
  const sortedIssues = [...timelineIssues].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          <span>Showing {sortedIssues.length} recent activities</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {sortedIssues.map((issue) => (
            <div key={issue.id} className="relative flex items-start gap-6">
              {/* Timeline dot */}
              <div className={`
                relative z-10 w-3 h-3 rounded-full flex-shrink-0 mt-6
                ${getStatusColor(issue.status)}
              `}>
                <div className="absolute inset-0 rounded-full animate-pulse opacity-25 bg-current scale-150"></div>
              </div>
              
              {/* Content */}
              <Card className="flex-1 max-w-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTypeColor(issue.type)}>
                          {issue.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {issue.priority}
                        </Badge>
                        <Badge variant={issue.status === 'done' ? 'default' : 'secondary'}>
                          {getStatusText(issue.status)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(issue.createdAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={issue.reporter.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {issue.reporter.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-medium">{issue.reporter.name}</p>
                        <p className="text-muted-foreground">Reporter</p>
                      </div>
                    </div>
                    
                    {issue.labels.length > 0 && (
                      <div className="flex gap-1">
                        {issue.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {issue.updatedAt > issue.createdAt && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Last updated: {formatDate(issue.updatedAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {sortedIssues.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No timeline activities</h3>
            <p className="text-muted-foreground">Create some issues to see timeline activities here.</p>
          </div>
        )}
      </div>
    </div>
  );
} 