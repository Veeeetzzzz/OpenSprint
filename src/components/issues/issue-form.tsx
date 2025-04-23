import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Issue } from '@/types'; // Import Issue type

// Define the type for the data needed to create an issue (excluding id, status, etc.)
type CreateIssueData = Omit<Issue, 'id' | 'status' | 'reporter' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'labels' | 'assignee' | 'epic' | 'estimate'>;

// Define component props
interface IssueFormProps {
  addIssue: (data: CreateIssueData) => void;
}

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['story', 'task', 'bug', 'epic']),
  priority: z.enum(['highest', 'high', 'medium', 'low', 'lowest']),
  description: z.string().min(1, 'Description is required'),
});

// Type for validated form values
type IssueFormValues = z.infer<typeof issueSchema>;

// Accept addIssue prop
export function IssueForm({ addIssue }: IssueFormProps) {
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'story',
      priority: 'medium',
    },
  });

  function onSubmit(values: IssueFormValues) {
    // Prepare data for addIssue (matching CreateIssueData)
    const issueData: CreateIssueData = {
      title: values.title,
      description: values.description,
      type: values.type, // Zod ensures this matches IssueType
      priority: values.priority, // Zod ensures this matches Priority
    };
    addIssue(issueData); // Call the function passed from App.tsx
    form.reset(); // Reset form fields
    console.log("Issue created:", issueData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter issue title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="highest">Highest</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit">Create Issue</Button>
        </div>
      </form>
    </Form>
  );
}