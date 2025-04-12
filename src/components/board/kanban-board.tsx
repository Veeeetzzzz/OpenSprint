import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Issue, IssueStatus } from '@/types';

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Implement authentication flow',
    description: 'Set up user authentication with OAuth',
    type: 'story',
    status: 'inProgress',
    priority: 'high',
    reporter: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&dpr=2&q=80',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    attachments: [],
    labels: ['auth', 'security'],
  },
  // Add more mock issues as needed
];

const columns: { title: string; status: IssueStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'Selected for Development', status: 'selected' },
  { title: 'In Progress', status: 'inProgress' },
  { title: 'Done', status: 'done' },
];

export function KanbanBoard() {
  return (
    <div className="h-full">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.status} className="w-80 flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground">
                {column.title}
              </h3>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {mockIssues.filter((issue) => issue.status === column.status).length}
              </span>
            </div>
            <div className="space-y-3">
              {mockIssues
                .filter((issue) => issue.status === column.status)
                .map((issue) => (
                  <Card key={issue.id} className="p-3 cursor-pointer hover:border-primary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {issue.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {issue.priority}
                      </Badge>
                      <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                    <h4 className="text-sm font-medium mb-2">{issue.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={issue.reporter.avatarUrl} />
                          <AvatarFallback>
                            {issue.reporter.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}