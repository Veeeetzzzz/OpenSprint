import { describe, expect, it } from 'vitest';
import { normalizeIssue, normalizeProject } from './api';

describe('api normalizers', () => {
  it('normalizes issue dates, nullable users, labels, and comments', () => {
    const issue = normalizeIssue({
      id: 'issue-1',
      title: 'Persist board state',
      description: null,
      type: 'task',
      status: 'todo',
      priority: 'medium',
      reporter: { id: 'user-1', name: 'Ada', email: 'ada@example.com' },
      assignee: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      comments: [
        {
          id: 'comment-1',
          content: 'Looks good',
          author: { id: 'user-2', name: 'Grace', email: 'grace@example.com', avatarUrl: null },
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      labels: [{ label: { name: 'backend' } }, { label: {} }],
    });

    expect(issue.description).toBe('');
    expect(issue.reporter.avatarUrl).toBeNull();
    expect(issue.assignee).toBeNull();
    expect(issue.labels).toEqual(['backend']);
    expect(issue.comments[0].author.avatarUrl).toBeNull();
  });

  it('normalizes project members', () => {
    const project = normalizeProject({
      id: 'project-1',
      name: 'OpenSprint',
      key: 'OS',
      description: null,
      type: 'kanban',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          projectId: 'project-1',
          role: 'admin',
          createdAt: '2026-01-01T00:00:00.000Z',
          user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' },
        },
      ],
    });

    expect(project.description).toBeNull();
    expect(project.members?.[0].user.avatarUrl).toBeNull();
  });
});
