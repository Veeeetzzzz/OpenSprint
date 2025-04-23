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
import type { Dispatch, SetStateAction } from 'react';

interface HeaderProps {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function Header({ setActiveTab }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-6">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
                Your Work
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/projects">
                Projects
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/filters">
                Filters
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/dashboards">
                Dashboards
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search issues" className="pl-8" />
          </div>
        </div>

        <Button variant="default" onClick={() => setActiveTab('create')}>Create</Button>
        <ThemeToggle />
      </div>
    </header>
  );
}