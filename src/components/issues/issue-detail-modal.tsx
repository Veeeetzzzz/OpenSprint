import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarIcon, 
  PersonIcon, 
  ChatBubbleIcon,
  Pencil1Icon,
  Cross2Icon
} from '@radix-ui/react-icons';
import type { Issue } from '@/types';

interface IssueDetailModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateIssue?: (updatedIssue: Issue) => void;
}

export function IssueDetailModal({ 
  issue, 
  isOpen, 
  onClose, 
  onUpdateIssue 
}: IssueDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');

  if (!issue) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'task':
        return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'bug':
        return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'epic':
        return 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest':
        return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'lowest':
        return 'bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'inProgress':
        return 'In Progress';
      case 'done':
        return 'Done';
      case 'backlog':
        return 'Backlog';
      default:
        return status;
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && onUpdateIssue) {
      const updatedIssue = {
        ...issue,
        comments: [
          ...issue.comments,
          {
            id: `comment-${Date.now()}`,
            content: newComment.trim(),
            author: issue.reporter, // Use current user in real implementation
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        updatedAt: new Date()
      };
      onUpdateIssue(updatedIssue);
      setNewComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeColor(issue.type)}>
                  {issue.type}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
                <Badge variant={issue.status === 'done' ? 'default' : 'secondary'}>
                  {getStatusText(issue.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">{issue.id}</span>
              </div>
              <DialogTitle className="text-xl">{issue.title}</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil1Icon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium mb-3">Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {issue.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div>
              <h3 className="text-sm font-medium mb-4">
                Comments ({issue.comments.length})
              </h3>
              
              <div className="space-y-4">
                {issue.comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatarUrl} />
                          <AvatarFallback>
                            {comment.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Comment */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={issue.reporter.avatarUrl} />
                        <AvatarFallback>
                          {issue.reporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            size="sm"
                          >
                            <ChatBubbleIcon className="h-4 w-4 mr-2" />
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-medium">Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <PersonIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reporter:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.reporter.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {issue.reporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{issue.reporter.name}</span>
                    </div>
                  </div>

                  {issue.assignee && (
                    <div className="flex items-center gap-2 text-sm">
                      <PersonIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={issue.assignee.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {issue.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{issue.assignee.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(issue.createdAt)}</span>
                  </div>

                  {issue.updatedAt > issue.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{formatDate(issue.updatedAt)}</span>
                    </div>
                  )}

                  {issue.estimate && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Estimate:</span>
                      <span className="font-medium">{issue.estimate} points</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 