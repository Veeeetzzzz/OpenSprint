import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@radix-ui/react-icons';
import type { Issue } from '@/types';
import type { IssueUpdateInput } from '@/lib/api';

interface IssueDetailModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (issueId: string, content: string) => Promise<Issue>;
  onDeleteIssue?: (issueId: string) => Promise<void>;
  onSaveIssue?: (issueId: string, updates: IssueUpdateInput) => Promise<Issue>;
  onUpdateIssue?: (updatedIssue: Issue) => void;
}

export function IssueDetailModal({
  issue,
  isOpen,
  onAddComment,
  onClose,
  onDeleteIssue,
  onSaveIssue,
  onUpdateIssue,
}: IssueDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (issue) {
      setEditTitle(issue.title);
      setEditDescription(issue.description);
      setActionError('');
      setIsEditing(false);
    }
  }, [issue]);

  if (!issue) return null;

  const formatDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return 'Unknown date';
    }
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) {
      return;
    }

    setIsSaving(true);
    setActionError('');
    try {
      const updatedIssue = await onAddComment(issue.id, newComment.trim());
      onUpdateIssue?.(updatedIssue);
      setNewComment('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!onSaveIssue || !editTitle.trim()) {
      return;
    }

    setIsSaving(true);
    setActionError('');
    try {
      const updatedIssue = await onSaveIssue(issue.id, {
        title: editTitle.trim(),
        description: editDescription,
      });
      onUpdateIssue?.(updatedIssue);
      setIsEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save issue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteIssue || !confirm('Delete this issue?')) {
      return;
    }

    setIsSaving(true);
    setActionError('');
    try {
      await onDeleteIssue(issue.id);
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete issue');
    } finally {
      setIsSaving(false);
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
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="text-xl font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{issue.title}</DialogTitle>
              )}
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
          <div className="lg:col-span-2 space-y-6">
            {actionError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {actionError}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-3">Description</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(issue.title);
                        setEditDescription(issue.description);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" disabled={isSaving || !editTitle.trim()} onClick={handleSave}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {issue.description || 'No description provided.'}
                  </p>
                </div>
              )}
            </div>

            <Separator />

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
                          <AvatarImage src={comment.author.avatarUrl || ''} />
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

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={issue.reporter.avatarUrl || ''} />
                        <AvatarFallback>
                          {issue.reporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(event) => setNewComment(event.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSaving || !onAddComment}
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

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-medium">Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <PersonIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reporter:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.reporter.avatarUrl || ''} />
                        <AvatarFallback className="text-xs">
                          {issue.reporter.name?.trim().charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{issue.reporter.name || 'Unknown'}</span>
                    </div>
                  </div>

                  {issue.assignee && (
                    <div className="flex items-center gap-2 text-sm">
                      <PersonIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={issue.assignee.avatarUrl || ''} />
                          <AvatarFallback className="text-xs">
                            {issue.assignee.name?.trim().charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{issue.assignee.name || 'Unknown'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(issue.createdAt)}</span>
                  </div>

                  {!Number.isNaN(new Date(issue.updatedAt).getTime()) &&
                    !Number.isNaN(new Date(issue.createdAt).getTime()) &&
                    new Date(issue.updatedAt).getTime() > new Date(issue.createdAt).getTime() && (
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

            {issue.labels.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {onDeleteIssue && (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={isSaving}
                onClick={handleDelete}
              >
                Delete Issue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
