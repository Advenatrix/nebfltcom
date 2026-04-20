# Nebulous Fleet Command

A web-based space strategy game where you command fleets across a galaxy of connected star systems.

## Features

- **Interactive Galaxy Map**: Click on star systems connected by FTL gates
- **Orbital Mechanics**: View planets with realistic orbital paths and animations
- **Fleet Management**: Command ships with weapon slots, ammo, and crew
- **Colony System**: Manage colonies and industries across planets

## Setup

### 1. Database Setup

This project uses Neon (free tier PostgreSQL) for the database.

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from your Neon dashboard
4. Update `.env.local`:

```bash
DATABASE_URL="your_neon_connection_string_here"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Database Schema

```bash
# Create tables
npm run db:create

# Seed with initial data
npm run db:seed

# Add buildings and ownership
npm run db:buildings

# Or run all at once:
npm run db:setup
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The database follows this hierarchy:
- **Factions** → Users → Fleets → Ships → Weapon Slots + Magazines
- **Star Systems** ↔ Gates (FTL connections)
- **Star Systems** → Planets → Colonies → Industries/Buildings

## API Endpoints

- `GET /api/star-systems` - List all star systems
- `GET /api/gates` - List all FTL gate connections
- `GET /api/systems/[id]/planets` - Get planets for a specific system

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: Neon (PostgreSQL)
- **Styling**: Tailwind CSS with custom CSS variables

## Development

The project is structured as follows:

```
app/
  api/              # API routes
  page.tsx          # Main page
components/
  star-map.tsx      # Galaxy map component
  system-detail.tsx # Planet orbital view
lib/
  db.ts             # Database connection
scripts/            # Database migration scripts
```