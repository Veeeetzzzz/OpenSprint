import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Link, useNavigate, useParams } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleCreateClick = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/create`);
    } else {
      navigate('/projects/default/create');
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 gap-6">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/your-work">Your Work</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/projects">Projects</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/filters">Filters</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/dashboards">Dashboards</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search issues" className="pl-8 bg-background" />
          </div>
        </div>

        <Button variant="default" onClick={handleCreateClick}>Create</Button>
        <ThemeToggle />
      </div>
    </header>
  );
}