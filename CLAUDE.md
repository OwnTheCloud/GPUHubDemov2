# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start Vite development server at http://localhost:3000
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Power Platform Development
- `npm run dev:power` - Start both Vite and PAC code servers (Windows only)
- `pac code init -n "App Name" -env <environmentId>` - Initialize Power Platform app
- `pac code add-data-source -a <apiId> -c <connectionId>` - Add data connections
- `pac code push` - Deploy to Power Platform (after npm run build)

### Power Platform Authentication
```bash
pac auth create --environment {environment-id}
```

## Architecture Overview

### Core Application Structure
The app uses a multi-provider wrapper pattern in `main.tsx`:
```
PowerProvider (Power Platform SDK) 
  → App (Contains all other providers)
    → ThemeProvider (Dark mode)
    → QueryClientProvider (React Query)
    → TooltipProvider (ShadCN tooltips)
    → BrowserRouter (React Router)
    → SidebarProvider (ShadCN sidebar state)
```

### Power Platform Integration
- **PowerProvider** (`src/PowerProvider.tsx`): Initializes `@pa-client/power-code-sdk` 
- **Vite Config**: Configured for Power Platform with port 3000, host "::", and base "./"
- **Build Target**: Power Platform requires specific TypeScript and build configurations

### Navigation Architecture
- **Dual Sidebar Modes**: Uses ShadCN sidebar with `collapsible="icon"` 
  - Expanded: Shows grouped collapsible sections (CO+I Signals, CSCP Signals)
  - Collapsed: Shows individual icons with tooltips
- **Conditional Rendering**: Menu items change based on sidebar state using `group-data-[state=*]` classes
- **Route Structure**: 7 pages organized in domain groups (signals/, cscp/)

### Data Layer
- **Mock Data**: Located in `src/data/` for demonstration
- **Data Tables**: Reusable `DataTable` component using TanStack Table
- **State Management**: React Query for async state, React hooks for local state

### UI System
- **Design System**: ShadCN UI components (`src/components/ui/`)
- **Theming**: TailwindCSS with CSS custom properties, next-themes for dark mode
- **Icons**: Lucide React throughout
- **Charts**: Recharts with custom ShadCN chart components

## Key Patterns

### Page Structure
All pages follow this pattern:
```tsx
export default function PageName() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Page Title</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
```

### Data Table Columns
Use TanStack Table column definitions with ShadCN Badge components for status:
```tsx
const columns: ColumnDef<Type>[] = [
  {
    accessorKey: "field",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Field Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // Status columns use Badge component
];
```

### Sidebar Menu Configuration
Navigation is defined in three arrays in `app-sidebar.tsx`:
- `menuItems`: Top-level pages
- `coiSignals`: CO+I Signals group 
- `cscpSignals`: CSCP Signals group

### Power Platform Specific Requirements

#### Port Configuration
Must use port 3000 for Power Platform compatibility. Never change this in vite.config.ts.

#### TypeScript Configuration
`verbatimModuleSyntax: false` required in tsconfig.app.json for Power Platform SDK compatibility.

#### SDK Usage
Power Platform SDK is initialized once in PowerProvider. For data connections:
1. Add data source via PAC CLI: `pac code add-data-source -a <apiId> -c <connectionId>`
2. Generated Models and Services appear in `src/Models` and `src/Services`
3. Schema references available in `.power/schemas`

#### Deployment Process
1. `npm run build`
2. `pac code push`

## File Organization

```
src/
├── components/
│   ├── ui/              # ShadCN components (auto-generated)
│   ├── app-sidebar.tsx  # Main navigation component
│   └── data-table.tsx   # Reusable table with TanStack Table
├── pages/
│   ├── Home.tsx         # Dashboard with Recharts area chart
│   ├── signals/         # CO+I Signals domain pages
│   └── cscp/           # CSCP Signals domain pages
├── data/               # Mock data for demonstration
├── App.tsx             # Provider setup and routing
├── main.tsx            # Entry point with PowerProvider
└── PowerProvider.tsx   # Power Platform SDK initialization
```

## Important Notes

- Always run `npm run lint` before commits
- Dark mode uses `next-themes` with system detection
- All pages are responsive and work in sidebar collapsed mode
- Mock data is structured to demonstrate table functionality
- Chart colors are defined in CSS custom properties in `index.css`
- Power Platform deployment requires "first release" region environments