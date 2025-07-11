import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { UserManagement } from './user-management';
import { useParams } from 'react-router-dom';

export function ProjectSettings() {
  const { projectId } = useParams();
  
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="bg-muted">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input defaultValue="Project Management System" />
          </div>
          <div>
            <Label>Project Key</Label>
            <Input defaultValue="PMS" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea defaultValue="A comprehensive project management system for agile teams." />
          </div>
          <div>
            <Label>Project Lead</Label>
            <Select defaultValue="john">
              <SelectTrigger>
                <SelectValue placeholder="Select project lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Project Type</Label>
            <Select defaultValue="scrum">
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scrum">Scrum</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="workflow" className="space-y-6">
        {/* Workflow settings content */}
      </TabsContent>
      <TabsContent value="members" className="space-y-6">
        {projectId && <UserManagement projectId={projectId} />}
      </TabsContent>
      <TabsContent value="permissions" className="space-y-6">
        {/* Permissions configuration content */}
      </TabsContent>
    </Tabs>
  );
}