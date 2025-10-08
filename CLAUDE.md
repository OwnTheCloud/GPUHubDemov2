# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start Vite development server at http://localhost:3000
- `npm run dev:full` - Start both API server (port 3333) and Vite dev server (port 3000) using start-dev.sh
- `npm run server` - Start Express API server only (port 3333) using working-api-server.js
- `npm run build` - Build for production 
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### OpenAI API Setup
1. Get API key from https://platform.openai.com/api-keys
2. Set `VITE_OPENAI_API_KEY=your_api_key` in `.env.local`
3. Optionally set `VITE_OPENAI_MODEL=gpt-4o-mini` for different model (defaults to gpt-4o-mini)
4. Run `npm run dev:full` to start both frontend and API server

**Note**: The API integration bypasses Vercel AI SDK's streamText due to compatibility issues and uses direct OpenAI API calls with custom stream formatting. The server sends proper AI SDK data stream format including required `message_annotations` array (`8:[]`) to prevent parsing errors.

### Power Platform Development
- `npm run dev:power` - Start Vite dev server with Power Platform CLI (requires pac cli)
- `npm run build:power` - Build and deploy to Power Platform
- `npm run deploy` - Deploy to Power Platform (pac code push)
- Power Platform SDK integrated with environment-aware initialization
- Uses defensive DOM mounting to prevent MutationObserver errors

## Architecture Overview

### Core Application Structure
The app uses a sophisticated multi-provider wrapper pattern with hybrid data architecture:

```
PowerProvider (Power Platform SDK + MutationObserver protection)
  → App (Router + Core Providers)
    → QueryClientProvider (React Query for async state)
    → ThemeProvider (Dark mode via next-themes, defaults to dark)
    → DuckDBProvider (In-browser SQL.js database)
    → TooltipProvider (ShadCN tooltips)
    → Router (BrowserRouter/HashRouter auto-switching)
    → DataProvider (Legacy mock data context)
    → ChatPanelProvider (AI chat panel state)
    → SidebarProvider (Collapsible sidebar state)
      → MainLayout (3-panel layout)
```

### Hybrid Data Architecture

The application implements a **progressive migration from mock data to SQL.js in-browser database**:

#### SQL.js Database Layer (`src/db/sqljs-manager.ts`)
- In-browser SQLite database using SQL.js WASM
- 8 core tables: `assets`, `investigation_signals`, `execution_signals`, `datacenters`, `stamps`, `demand_ids`, `universal_supply`, `dashboard_metrics`
- Full transaction support, prepared statements, and batch operations
- Defensive initialization with retry logic and comprehensive error handling

#### Legacy Mock Data Layer (`src/contexts/data-context.tsx`)  
- Maintains compatibility with components not yet migrated
- Provides cached stats and periodic refresh (30s intervals)
- Used as fallback when database operations fail

#### Hook-based Data Access (`src/hooks/use-duckdb.tsx`)
- Comprehensive set of query and mutation hooks for each table
- Auto-save functionality and optimistic updates
- Type-safe database operations with proper error boundaries

### Power Platform Integration Strategy

**Environment-aware dual deployment** with automatic detection:

#### PowerProvider (`src/PowerProvider.tsx`)
- Dynamic SDK initialization only in Power Platform environments
- **MutationObserver Protection**: Custom wrapper prevents runtime errors from browser extensions
- Graceful degradation with comprehensive error boundaries
- Cleanup functions prevent memory leaks

#### Environment Detection (`src/lib/environment.ts`)
- Automatic Power Platform detection via hostname patterns
- Router switching: BrowserRouter (local) ↔ HashRouter (Power Platform)
- Environment-specific feature flags and configurations

#### Dual-Mode Chat System
- **Local Development**: Express server (`working-api-server.js`) with OpenAI proxy and tool execution
- **Power Platform**: Client-side OpenAI integration (`ClientSideOpenAI`) to bypass 405 errors
- Automatic fallback and visual mode indicators in chat header

### Advanced Navigation Architecture

#### Dual Display Sidebar Pattern
Uses `group-data-[state=*]` classes for contextual rendering:
- **Expanded**: Hierarchical collapsible sections (CO+I Signals, CSCP Signals)
- **Collapsed**: Flattened individual icons with tooltips
- Navigation arrays: `menuItems`, `coiSignals`, `cscpSignals` in `app-sidebar.tsx`

#### Three-Panel Responsive Layout
```
[Sidebar] [Main Content with dynamic padding] [Chat Panel]
```
- Chat panel: 384px expanded ↔ 48px collapsed with smooth transitions
- Main content automatically adjusts padding based on chat panel state
- Sidebar: Icon mode vs full navigation with persistent state

### Streaming AI Integration

#### Custom Stream Processing
Converts OpenAI Server-Sent Events to AI SDK data stream format:
- Text chunks: `0:"content"`
- Tool calls: `9:{toolCallId, toolName, args, result}`
- Message annotations: `8:[]` (required empty array to prevent parsing errors)
- Completion data: `d:{finishReason, usage}`

#### Tool Execution with Database Integration
- Function calling for GPU datacenter queries using SQL.js database
- Fallback to legacy mock data if database queries fail
- Real-time metrics calculation and intelligent caching
- Error boundaries prevent tool failures from breaking chat flow

### Advanced UI Component System

#### ShadCN Foundation with Extensions
- 50+ UI components built on Radix UI primitives with custom extensions
- **Editable Data Tables**: TanStack Table v8 with inline editing, auto-save, and CSV export
- **Advanced Charts**: Recharts with custom ShadCN chart components and interactive drill-downs
- **Chat Interface**: Full AI integration with syntax highlighting (Shiki), audio visualizer, and streaming

#### Theming and Styling
- TailwindCSS with CSS custom properties for dynamic theming
- Dark mode via next-themes (defaults to dark) with system detection
- Comprehensive color system supporting both light and dark modes
- Custom chart colors defined in CSS custom properties

## Key Architectural Patterns

### Database Migration Pattern
Components progressively migrate from mock data to SQL.js:
```tsx
// Hook-based approach allows gradual migration
const { data, loading, error } = useAssets(); // Tries SQL.js first, falls back to mock data
```

### Environment-Aware Component Pattern
```tsx
// Components adapt behavior based on deployment environment
const chat = useEnvironmentAwareChat(); // Different implementations for local vs Power Platform
```

### Provider Composition Pattern
Each provider handles a specific concern with clear boundaries:
- **PowerProvider**: Platform integration and error handling
- **DuckDBProvider**: Database state and connection management  
- **ChatPanelProvider**: AI chat state and panel management
- **DataProvider**: Legacy data compatibility layer

### Defensive Programming Pattern
- MutationObserver protection prevents external script errors
- Database operations have comprehensive retry logic
- Component error boundaries prevent cascade failures
- Global error handlers for uncaught exceptions

### Page Structure Pattern
All pages follow consistent structure:
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

### Data Table Column Pattern
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
  // Status columns use Badge component with consistent styling
];
```

## Power Platform Specific Requirements

### Critical Configuration
- **Port 3000**: Required for Power Platform compatibility, never change in vite.config.ts
- **Vite External Modules**: Power Platform SDK must be in `rollupOptions.external` to prevent bundling errors
- **TypeScript**: Relaxed type checking with `noImplicitAny: false`, `strictNullChecks: false` for compatibility

### Deployment Process
1. Set `VITE_OPENAI_API_KEY` environment variable  
2. Optionally set `VITE_OPENAI_MODEL` (defaults to gpt-4o-mini)
3. `npm run build` (validates external dependencies)
4. `pac code push` (deploys to Power Platform)
5. Verify environment detection and chat mode indicators

### Visual Environment Indicators
- 🔵 **Wifi icon**: Power Platform client-side mode
- 🟢 **WifiOff icon**: Local development server mode  
- Chat header displays deployment context and active mode

## Critical Development Notes

### API Server Management
- **Stream Format**: working-api-server.js sends AI SDK-compatible format to prevent parsing errors
- **Server Restart**: After changes: `pkill -f "working-api-server.js" && node working-api-server.js &`
- **Health Check**: Available at `http://localhost:3333/api/health`
- **Environment Loading**: Automatically loads `.env.local` for API keys

### Database Development
- SQL.js database initialized on first use with automatic schema creation
- Use `useDuckDBManager()` hook to access database instance and utilities
- Database operations are wrapped in error boundaries with mock data fallbacks
- Always test both successful database operations and fallback scenarios

### Error Handling Strategy
- PowerProvider includes global MutationObserver protection
- All database hooks include error boundaries and fallback logic
- Chat system has comprehensive error handling for both local and Power Platform modes
- Use defensive programming patterns throughout component development

### Performance Considerations
- React Query handles caching and background updates for database queries
- SQL.js operations are batched where possible to improve performance  
- Chart components use memoization to prevent unnecessary re-renders
- Chat streaming is optimized with proper cleanup to prevent memory leaks

## Build System Notes

### Vite Configuration Essentials
- Port 3000 and host "::" required for Power Platform
- External modules configuration prevents bundling conflicts
- API proxy to port 3333 for local development
- CORS headers configured for DuckDB WASM compatibility

### TypeScript Configuration  
- Path aliases: `@/*` maps to `./src/*`
- `skipLibCheck: true` and `allowJs: true` for maximum compatibility
- Relaxed type checking optimized for Power Platform deployment constraints

Always run `npm run lint` before commits to maintain code quality and consistency.