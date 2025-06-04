import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Issue } from '@/types';

interface ProjectStatsProps {
  issues?: Issue[];
}

export function ProjectStats({ issues = [] }: ProjectStatsProps) {
  // Calculate real statistics from issues
  const totalIssues = issues.length;
  const completedIssues = issues.filter(issue => issue.status === 'done').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'inProgress').length;
  const todoIssues = issues.filter(issue => issue.status === 'todo').length;
  const backlogIssues = issues.filter(issue => issue.status === 'backlog').length;
  
  // Calculate progress percentage
  const progressPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  
  // Calculate average estimate (velocity approximation)
  const issuesWithEstimates = issues.filter(issue => issue.estimate);
  const totalEstimate = issuesWithEstimates.reduce((sum, issue) => sum + (issue.estimate || 0), 0);
  const avgEstimate = issuesWithEstimates.length > 0 ? Math.round(totalEstimate / issuesWithEstimates.length * 10) / 10 : 0;
  
  // Calculate average cycle time (mock calculation)
  const completedIssuesWithDates = issues.filter(issue => issue.status === 'done');
  const avgCycleTime = completedIssuesWithDates.length > 0 
    ? Math.round(completedIssuesWithDates.reduce((sum, issue) => {
        const daysDiff = Math.abs(new Date(issue.updatedAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + daysDiff;
      }, 0) / completedIssuesWithDates.length * 10) / 10
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIssues}</div>
          <p className="text-xs text-muted-foreground">
            {completedIssues} completed, {inProgressIssues} in progress
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progressPercentage}%</div>
          <Progress value={progressPercentage} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgEstimate} points</div>
          <p className="text-xs text-muted-foreground">Per issue with estimates</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Cycle Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCycleTime} days</div>
          <p className="text-xs text-muted-foreground">Time to completion</p>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Issue Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Backlog', count: backlogIssues },
              { name: 'To Do', count: todoIssues },
              { name: 'In Progress', count: inProgressIssues },
              { name: 'Done', count: completedIssues },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}