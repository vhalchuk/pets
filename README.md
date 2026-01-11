# Pet Projects

A monolith web application showcasing various pet projects, built with TypeScript + React.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (install via `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This will start the development server at `http://localhost:5173`

### Build

```bash
pnpm build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
pnpm preview
```

### Linting

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting errors
pnpm lint:fix
```

### Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Project Structure

```
pets/
├── src/
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```
