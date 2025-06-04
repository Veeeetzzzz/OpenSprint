import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MagnifyingGlassIcon, 
  MixerHorizontalIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CalendarIcon,
  PersonIcon
} from '@radix-ui/react-icons';
import type { Issue, Priority, IssueType } from '@/types';

interface BacklogPageProps {
  issues?: Issue[];
}

// Mock backlog data - used as fallback when no issues are passed
const mockBacklogIssues: Issue[] = [
  {
    id: 'ISS-004',
    title: 'Implement user dashboard',
    description: 'Create a comprehensive dashboard for users to view their tasks and projects',
    type: 'story',
    status: 'backlog',
    priority: 'highest',
    reporter: { 
      id: 'user-1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-18T10:00:00Z'),
    comments: [],
    attachments: [],
    labels: ['dashboard', 'ui'],
    estimate: 8
  },
  {
    id: 'ISS-005',
    title: 'Add search functionality',
    description: 'Users should be able to search through issues and projects',
    type: 'task',
    status: 'backlog',
    priority: 'high',
    reporter: { 
      id: 'user-2', 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-19T09:15:00Z'),
    updatedAt: new Date('2024-01-19T09:15:00Z'),
    comments: [],
    attachments: [],
    labels: ['search', 'feature'],
    estimate: 5
  },
  {
    id: 'ISS-006',
    title: 'Performance optimization',
    description: 'Optimize application performance for better user experience',
    type: 'task',
    status: 'backlog',
    priority: 'medium',
    reporter: { 
      id: 'user-1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-20T14:30:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z'),
    comments: [],
    attachments: [],
    labels: ['performance', 'optimization'],
    estimate: 13
  },
  {
    id: 'ISS-007',
    title: 'Fix mobile responsiveness',
    description: 'Some components are not responsive on smaller screens',
    type: 'bug',
    status: 'backlog',
    priority: 'low',
    reporter: { 
      id: 'user-3', 
      name: 'Bob Wilson', 
      email: 'bob@example.com', 
      avatarUrl: '' 
    },
    createdAt: new Date('2024-01-21T11:00:00Z'),
    updatedAt: new Date('2024-01-21T11:00:00Z'),
    comments: [],
    attachments: [],
    labels: ['mobile', 'responsive'],
    estimate: 3
  }
];

// Priority order for sorting
const priorityOrder: Record<Priority, number> = {
  'highest': 5,
  'high': 4,
  'medium': 3,
  'low': 2,
  'lowest': 1
};

// Helper functions
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'highest':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'lowest':
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getTypeColor = (type: IssueType) => {
  switch (type) {
    case 'story':
      return 'bg-green-100 text-green-800';
    case 'task':
      return 'bg-blue-100 text-blue-800';
    case 'bug':
      return 'bg-red-100 text-red-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export function BacklogPage({ issues = [] }: BacklogPageProps) {
  // Use passed issues or fallback to mock data, filter for backlog status
  const backlogIssues = issues.length > 0 
    ? issues.filter(issue => issue.status === 'backlog')
    : mockBacklogIssues;
    
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'estimate'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort issues
  const filteredAndSortedIssues = backlogIssues
    .filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
      const matchesType = filterType === 'all' || issue.type === filterType;
      
      return matchesSearch && matchesPriority && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'estimate':
          comparison = (a.estimate || 0) - (b.estimate || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Backlog</h2>
          <p className="text-muted-foreground">
            Manage and prioritize your project backlog
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedIssues.length} of {backlogIssues.length} issues
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="estimate">Estimate</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredAndSortedIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Priority indicator */}
                <div className={`w-1 h-16 rounded-full ${getPriorityColor(issue.priority).split(' ')[0]}`} />
                
                {/* Issue content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getTypeColor(issue.type)}>
                          {issue.type}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {issue.id}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-1">{issue.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <PersonIcon className="h-3 w-3" />
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={issue.reporter.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {issue.reporter.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{issue.reporter.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </div>
                        
                        {issue.estimate && (
                          <div className="flex items-center gap-1">
                            <span>{issue.estimate} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedIssues.length === 0 && (
          <div className="text-center py-12">
            <MixerHorizontalIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No issues found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterPriority !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Your backlog is empty. Create some issues to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 