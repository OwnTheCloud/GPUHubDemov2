import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Home, 
  Box, 
  Database, 
  Cpu, 
  Activity, 
  Building2, 
  Package, 
  Search,
  Settings,
  HelpCircle,
  Printer,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const navigationCommands = [
    {
      icon: Home,
      label: 'Dashboard',
      description: 'Go to dashboard home',
      command: () => navigate('/'),
    },
    {
      icon: Box,
      label: 'Universal Supply',
      description: 'View GPU supply management',
      command: () => navigate('/universal-supply'),
    },
    {
      icon: Search,
      label: 'Investigation Signals',
      description: 'View investigation signals',
      command: () => navigate('/investigation-signals'),
    },
    {
      icon: Activity,
      label: 'Execution Signals',
      description: 'View execution signals',
      command: () => navigate('/execution-signals'),
    },
    {
      icon: Building2,
      label: 'Datacenters',
      description: 'Manage datacenter information',
      command: () => navigate('/datacenters'),
    },
    {
      icon: Package,
      label: 'Stamps',
      description: 'View stamp management',
      command: () => navigate('/stamps'),
    },
    {
      icon: Database,
      label: 'Demand IDs',
      description: 'Manage demand identifiers',
      command: () => navigate('/demand-ids'),
    },
  ];

  const actionCommands = [
    {
      icon: Printer,
      label: 'Print Page',
      description: 'Print current page',
      command: () => window.print(),
    },
    {
      icon: RefreshCw,
      label: 'Refresh Page',
      description: 'Reload the current page',
      command: () => window.location.reload(),
    },
    {
      icon: Download,
      label: 'Export Data',
      description: 'Export current table data',
      command: () => toast.info('Select rows in a table to export data'),
    },
    {
      icon: Settings,
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      command: () => {
        const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark');
        toast.success(`Switched to ${theme} mode`);
      },
    },
  ];

  const helpCommands = [
    {
      icon: HelpCircle,
      label: 'Keyboard Shortcuts',
      description: 'View available keyboard shortcuts',
      command: () => toast.info('⌘K / Ctrl+K: Open command palette\n⌘/ / Ctrl+/: Focus search', {
        duration: 5000,
      }),
    },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        className="h-12"
      />
      <CommandList className="max-h-96">
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationCommands.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.command)}
              className="flex items-center space-x-3 p-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionCommands.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.command)}
              className="flex items-center space-x-3 p-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          {helpCommands.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.command)}
              className="flex items-center space-x-3 p-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook for easy usage
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(prev => !prev);
  const close = () => setOpen(false);
  const show = () => setOpen(true);

  return {
    open,
    setOpen,
    toggle,
    close,
    show,
    CommandPalette: (props: Omit<CommandPaletteProps, 'open' | 'onOpenChange'>) => (
      <CommandPalette {...props} open={open} onOpenChange={setOpen} />
    ),
  };
}