# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start Vite development server at http://localhost:3000
- `npm run dev:full` - Start both API server (port 3333) and Vite dev server (port 3000)
- `npm run server` - Start Express API server only (port 3333)
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### OpenAI API Setup
1. Get API key from https://platform.openai.com/api-keys
2. Set `VITE_OPENAI_API_KEY=your_api_key` in `.env.local`
3. Optionally set `VITE_OPENAI_MODEL=gpt-4-turbo` for different model
4. Run `npm run dev:full` to start both frontend and API server

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
    → QueryClientProvider (React Query)
    → ThemeProvider (Dark mode)
    → TooltipProvider (ShadCN tooltips)
    → BrowserRouter/HashRouter (React Router - auto-detects Power Platform)
    → ChatPanelProvider (AI chat functionality)
    → SidebarProvider (ShadCN sidebar state)
      → MainLayout (3-panel layout with sidebars and main content)
```

### Power Platform Integration
- **PowerProvider** (`src/PowerProvider.tsx`): Initializes `@pa-client/power-code-sdk` 
- **Vite Config**: Configured for Power Platform with port 3000, host "::", and base "./"
- **Build Target**: Power Platform requires specific TypeScript and build configurations

### Layout Architecture  
- **Three-Panel Layout**: Left sidebar (navigation) + Main content + Right sidebar (AI chat)
- **Dynamic Routing**: Auto-detects Power Platform context and switches between BrowserRouter and HashRouter
- **Responsive Design**: Chat panel positioning adjusts main content padding dynamically

### Navigation Architecture
- **Dual Sidebar Modes**: Uses ShadCN sidebar with `collapsible="icon"` 
  - Expanded: Shows grouped collapsible sections (CO+I Signals, CSCP Signals)
  - Collapsed: Shows individual icons with tooltips
- **Conditional Rendering**: Menu items change based on sidebar state using `group-data-[state=*]` classes
- **Route Structure**: 7 pages organized in domain groups (signals/, cscp/)

### AI Chat Integration
- **OpenAI Integration**: Powered by OpenAI GPT models via Vercel AI SDK
- **Chat Panel**: Fixed position right sidebar with collapsible functionality
- **Context Aware**: Chat panel state affects main content area padding
- **Provider Pattern**: Uses ChatPanelProvider for state management across components
- **GPU-Specific Prompts**: System prompt tailored for GPU infrastructure management
- **Error Handling**: Shows configuration errors when API key is missing

### Data Layer
- **Mock Data**: Located in `src/data/` for demonstration
- **Data Tables**: Reusable `DataTable` component using TanStack Table with editable cells
- **State Management**: React Query for async state, React hooks for local state
- **Auto-save**: Built-in auto-save functionality for editable tables
- **Export/Import**: CSV export functionality with bulk operations support

### UI System
- **Design System**: ShadCN UI components (`src/components/ui/`)
- **Theming**: TailwindCSS with CSS custom properties, next-themes for dark mode (defaults to dark)
- **Icons**: Lucide React throughout
- **Charts**: Recharts with custom ShadCN chart components
- **Audio/Visual**: Audio visualizer components with recording capabilities
- **AI Components**: Custom chat interface with markdown rendering and syntax highlighting

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
- `strict: false` mode used for Power Platform compatibility
- Path aliases configured with `@/*` pointing to `./src/*`
- Relaxed linting rules for faster development

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
├── api/
│   └── chat.ts             # OpenAI API integration (legacy)
├── components/
│   ├── ui/                 # ShadCN components (auto-generated)
│   ├── app-sidebar.tsx     # Main navigation component  
│   ├── app-chatpanel.tsx   # AI chat panel component
│   ├── data-table.tsx      # Reusable table with TanStack Table
│   ├── AssetCard.tsx       # Asset display component
│   └── AssetDetail.tsx     # Asset detail view
├── pages/
│   ├── Home.tsx            # Dashboard with Recharts area chart
│   ├── UniversalSupply.tsx # Supply management page
│   ├── signals/            # CO+I Signals domain pages
│   │   ├── InvestigationSignals.tsx
│   │   └── ExecutionSignals.tsx
│   └── cscp/              # CSCP Signals domain pages
│       ├── Datacenters.tsx
│       ├── Stamps.tsx
│       └── DemandIDs.tsx
├── data/                  # Mock data for demonstration
│   ├── assets.ts          # Asset data structures
│   └── owners.ts          # Owner/user data
├── hooks/                 # Custom React hooks
│   ├── use-auto-save.tsx  # Auto-save functionality
│   ├── use-audio-recording.ts # Audio recording
│   └── use-mobile.tsx     # Mobile detection
├── lib/                   # Utility functions
│   ├── utils.ts           # General utilities
│   └── audio-utils.ts     # Audio processing
├── types/                 # TypeScript type definitions
│   └── asset.ts           # Asset type definitions
├── App.tsx               # Provider setup and routing
├── main.tsx              # Entry point with PowerProvider
├── PowerProvider.tsx     # Power Platform SDK initialization
└── server.js             # Express API server for OpenAI integration
```

## Important Notes

- Always run `npm run lint` before commits
- Dark mode uses `next-themes` with system detection (defaults to dark theme)
- All pages are responsive and work in sidebar collapsed mode
- Mock data is structured to demonstrate table functionality
- Chart colors are defined in CSS custom properties in `index.css`
- Power Platform deployment requires "first release" region environments
- MutationObserver errors are suppressed in Power Platform context (handled in PowerProvider)
- Router automatically switches between BrowserRouter and HashRouter based on environment