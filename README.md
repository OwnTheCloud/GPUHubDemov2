# GPU Hub Demo - Power Platform Code App

A modern Power Platform Code App built with React, Vite, and ShadCN UI components, featuring a comprehensive dashboard for GPU infrastructure management.

## Features

- **Beautiful Dashboard Home Page** with area charts showing key metrics
- **Collapsible Sidebar Navigation** with grouped sections and icon-only mode
- **Dark Mode Support** with toggle button in sidebar footer
- **Data Tables** with sorting, filtering, and pagination for all data views
- **7 Pages Total**:
  - Home (Dashboard with area chart)
  - Universal Supply
  - CO+I Signals (collapsible group):
    - Investigation Signals
    - Execution Signals
  - CSCP Signals (collapsible group):
    - Datacenters
    - Stamps
    - Demand IDs

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **ShadCN UI** components with Radix UI primitives
- **TailwindCSS** for styling
- **TanStack Table** for data tables
- **Recharts** for beautiful charts
- **React Router** for navigation
- **Power Platform SDK** for deployment

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Power Apps CLI
- Power Platform environment with "first release" region setting

### Development

1. **Local Development** (for UI development):
   ```bash
   npm install
   npm run dev
   ```
   Opens at http://localhost:3000

2. **Power Platform Development** (for full integration):
   ```bash
   npm install
   pac auth create --environment {your-environment-id}
   pac code init
   npm run dev:power
   ```

### Building and Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy to Power Platform**:
   ```bash
   pac code push
   ```

## Project Structure

```
src/
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── app-sidebar.tsx     # Main navigation sidebar
│   └── data-table.tsx      # Reusable data table component
├── pages/
│   ├── Home.tsx            # Dashboard with area chart
│   ├── UniversalSupply.tsx # Universal supply data table
│   ├── signals/            # CO+I Signals pages
│   │   ├── InvestigationSignals.tsx
│   │   └── ExecutionSignals.tsx
│   └── cscp/               # CSCP Signals pages
│       ├── Datacenters.tsx
│       ├── Stamps.tsx
│       └── DemandIDs.tsx
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point with PowerProvider
└── PowerProvider.tsx      # Power Platform SDK integration
```

## Key Features

### Responsive Sidebar Navigation
- Collapsible sidebar with grouped navigation
- CO+I Signals and CSCP Signals groups default to expanded
- Active page highlighting
- Icon-only mode when collapsed with tooltips
- Dark mode toggle in footer

### Data Tables
- Built with TanStack Table
- Sorting, filtering, and pagination
- Column visibility controls
- Responsive design
- Status badges for visual clarity

### Dashboard Charts
- Beautiful area charts using Recharts
- Responsive and interactive
- Support for light/dark themes
- Gradient fills and smooth animations

### Power Platform Integration
- Ready for deployment with PAC CLI
- PowerProvider component for SDK initialization
- Configured for port 3000 (required by Power Platform)
- TypeScript configuration optimized for Power Platform

## Commands

- `npm run dev` - Start Vite development server
- `npm run dev:power` - Start both Vite and PAC code servers
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Notes

- Uses port 3000 for Power Platform compatibility
- All components use ShadCN UI for consistency
- Mock data included for demonstration
- Fully typed with TypeScript
- Responsive design works on all screen sizes

## Next Steps

1. Replace mock data with real Power Platform data connections
2. Add authentication and user management
3. Implement real-time updates for live data
4. Add more chart types and visualizations
5. Extend with additional pages as needed