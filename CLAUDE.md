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
PowerProvider (Power Platform SDK initialization with error suppression)
  → App (Contains all other providers)
    → QueryClientProvider (React Query for async state)
    → ThemeProvider (Dark mode with next-themes, defaults to dark)
    → TooltipProvider (ShadCN tooltips)
    → BrowserRouter/HashRouter (Auto-detects Power Platform via hostname)
    → ChatPanelProvider (AI chat panel state management)
    → SidebarProvider (ShadCN sidebar collapsible state)
      → MainLayout (3-panel: sidebar + main content + chat panel)
```

### Power Platform Integration
- **PowerProvider** (`src/PowerProvider.tsx`): Initializes `@pa-client/power-code-sdk` 
- **Vite Config**: Configured for Power Platform with port 3000, host "::", and base "./"
- **Build Target**: Power Platform requires specific TypeScript and build configurations

### Layout Architecture  
- **Three-Panel Layout**: Left sidebar (navigation) + Main content + Right sidebar (AI chat)
- **Dynamic Routing**: Auto-detects Power Platform context via `window.location.hostname.includes('powerapps.com')`
- **Responsive Design**: Chat panel (fixed right, 24rem when expanded, 3rem when collapsed) adjusts main content padding
- **Chat Panel States**: Collapsed (12px width with toggle button) and expanded (384px width with full interface)

### Navigation Architecture
- **Dual Sidebar Modes**: Uses ShadCN sidebar with `collapsible="icon"` 
  - Expanded: Shows grouped collapsible sections (CO+I Signals, CSCP Signals)
  - Collapsed: Shows individual icons with tooltips
- **Conditional Rendering**: Menu items change based on sidebar state using `group-data-[state=*]` classes
- **Route Structure**: 7 pages organized in domain groups (signals/, cscp/)

### AI Chat Integration
- **Direct OpenAI Integration**: Uses custom working-api-server.js that bypasses Vercel AI SDK issues
- **Chat Panel**: Fixed position right sidebar (app-chatpanel.tsx) with collapsible functionality
- **Stream Processing**: Custom stream format conversion from OpenAI SSE to AI SDK data stream format
  - Sends `0:"text"` for content chunks
  - Sends `8:[]` for message_annotations (required empty array)
  - Sends `d:{finishReason,usage}` for completion data
- **Provider Pattern**: ChatPanelProvider manages isExpanded state and toggleExpanded callback
- **GPU-Specific Context**: System prompt and suggestions tailored for GPU infrastructure management
- **Error Handling**: Displays API key configuration errors and connection issues
- **API Server**: Runs on port 3333 with CORS, health check endpoint, and proper error handling

### Data Layer
- **Mock Data**: Located in `src/data/` (assets.ts, owners.ts) for demonstration
- **Data Tables**: Reusable `DataTable` component using TanStack Table v8 with editable cells
- **State Management**: React Query for async state, React hooks for local state
- **Auto-save**: Built-in auto-save functionality via use-auto-save.tsx hook
- **Editable Components**: Custom editable-cell.tsx, editable-input.tsx, editable-select.tsx
- **Export/Import**: CSV export functionality with bulk operations support

### UI System
- **Design System**: ShadCN UI components (`src/components/ui/`) built on Radix UI primitives
- **Theming**: TailwindCSS with CSS custom properties, next-themes for dark mode (defaults to dark)
- **Icons**: Lucide React throughout (Home, Box, Database, Cpu, Activity, etc.)
- **Charts**: Recharts with custom ShadCN chart components
- **Chat Components**: Custom chat interface (chat.tsx, message-list.tsx, markdown-renderer.tsx) with syntax highlighting via Shiki
- **Audio Components**: Audio visualizer and recording capabilities (audio-visualizer.tsx, use-audio-recording.ts)
- **Mobile Detection**: use-mobile.tsx hook for responsive behavior

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
- `menuItems`: Top-level pages (Home, Universal Supply)
- `coiSignals`: CO+I Signals group (Investigation Signals, Execution Signals)
- `cscpSignals`: CSCP Signals group (Datacenters, Stamps, Demand IDs)

**Dual Display Logic**: Uses `group-data-[state=*]` classes to show:
- Expanded: Collapsible groups with sub-items
- Collapsed: Individual icons with tooltips (all items flattened)

### Power Platform Specific Requirements

#### Port Configuration
Must use port 3000 for Power Platform compatibility. Never change this in vite.config.ts.

#### TypeScript Configuration
- Relaxed type checking for Power Platform compatibility:
  - `noImplicitAny: false`
  - `strictNullChecks: false` 
  - `noUnusedParameters: false`
  - `noUnusedLocals: false`
- Path aliases configured with `@/*` pointing to `./src/*`
- `skipLibCheck: true` and `allowJs: true` for compatibility

#### SDK Usage
Power Platform SDK is initialized in PowerProvider with error suppression:
- Suppresses MutationObserver and web-client-content-script errors
- Graceful fallback if SDK initialization fails
- Loading state shown during initialization

For data connections:
1. `pac auth create --environment {environment-id}`
2. `pac code add-data-source -a <apiId> -c <connectionId>`
3. Generated Models and Services appear in `src/Models` and `src/Services`
4. Schema references available in `.power/schemas`

#### Deployment Process
1. `npm run build`
2. `pac code push`

## File Organization

```
src/
├── components/
│   ├── ui/                 # ShadCN components (50+ components)
│   │   ├── chat.tsx        # Main chat interface
│   │   ├── sidebar.tsx     # Collapsible sidebar component
│   │   ├── editable-*.tsx  # Editable table cell components
│   │   └── audio-*.tsx     # Audio visualization components
│   ├── app-sidebar.tsx     # Main navigation with dual display modes
│   ├── app-chatpanel.tsx   # AI chat panel with context provider
│   ├── data-table.tsx      # Reusable table with TanStack Table v8
│   ├── AssetCard.tsx       # Asset display component
│   └── AssetDetail.tsx     # Asset detail view
├── pages/                  # 7 total pages
│   ├── Home.tsx            # Dashboard with Recharts area chart
│   ├── Index.tsx           # Legacy index page
│   ├── UniversalSupply.tsx # Supply management page
│   ├── signals/            # CO+I Signals domain (2 pages)
│   └── cscp/              # CSCP Signals domain (3 pages)
├── data/                  # Mock data for demonstration
│   ├── assets.ts          # Asset data structures
│   └── owners.ts          # Owner/user data
├── hooks/                 # Custom React hooks
│   ├── use-auto-save.tsx  # Auto-save functionality
│   ├── use-audio-recording.ts # Audio recording
│   └── use-mobile.tsx     # Mobile detection hook
├── lib/                   # Utility functions
│   ├── utils.ts           # General utilities (cn, etc.)
│   └── audio-utils.ts     # Audio processing utilities
├── types/                 # TypeScript type definitions
│   └── asset.ts           # Asset type definitions
├── App.tsx               # Provider setup and routing logic
├── main.tsx              # Entry point with PowerProvider
├── PowerProvider.tsx     # Power Platform SDK with error handling
public/
├── favicon.png          # 512x512 GPU chip favicon
└── gpu-icon.png         # Original GPU icon for high-res displays
working-api-server.js     # Express API server bypassing AI SDK issues
start-dev.sh             # Development startup script
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
- Favicon is a GPU chip icon from UXWing (commercial use allowed) in `public/` directory

## Critical API Server Notes

- **Stream Format**: The working-api-server.js sends AI SDK-compatible data stream format to prevent "message_annotations" parsing errors
- **Server Restart**: After any changes to working-api-server.js, restart with `pkill -f "working-api-server.js" && node working-api-server.js &`
- **Health Check**: Test server health at `http://localhost:3333/api/health`
- **Environment**: Server loads `.env.local` for `VITE_OPENAI_API_KEY` and `VITE_OPENAI_MODEL`

## Power Platform Deployment

### Environment-Aware Chat System
The application automatically detects the deployment environment and uses the appropriate chat integration:

- **Local Development**: Uses Express server (`working-api-server.js`) via `/api/chat` proxy
- **Power Platform**: Uses client-side OpenAI integration (`ClientSideOpenAI`) to bypass 405 errors

### Key Files for Power Platform Support
- `src/lib/environment.ts` - Environment detection utilities
- `src/lib/openai-client-side.ts` - Client-side OpenAI integration for Power Platform
- `src/hooks/use-environment-aware-chat.ts` - Hook that switches between server/client modes
- `src/components/app-chatpanel.tsx` - Updated to use environment-aware chat

### Power Platform Requirements
1. **API Key Configuration**: Set `VITE_OPENAI_API_KEY` as environment variable before building
2. **Build Process**: OpenAI API key must be available at build time (not runtime)
3. **CORS Handling**: Client-side integration handles CORS automatically via direct OpenAI API calls
4. **Error Handling**: 405 "UnsupportedHttpVerb" errors are handled gracefully with fallback to client mode

### Deployment Checklist
1. Set `VITE_OPENAI_API_KEY` environment variable
2. Optionally set `VITE_OPENAI_MODEL` (defaults to gpt-4o-mini)
3. Run `npm run build`
4. Run `pac code push`
5. Verify chat functionality shows "Power Platform Mode" indicator

### Visual Indicators
- 🔵 **Wifi icon**: Power Platform client-side mode
- 🟢 **WifiOff icon**: Local development server mode
- Chat header shows deployment context and mode status