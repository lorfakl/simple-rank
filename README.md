# simple rank

A clean, intuitive web application for creating and sharing custom rankings. Built with React + Vite for a fast, responsive user experience.

🌐 **Live Application**: [https://simplerank.io](https://simplerank.io)

## Overview

Simple Rank is a standalone web application that allows users to create custom rankings for any topic and easily share them with others. Whether you're ranking your favorite movies, comparing products, or organizing ideas, Simple Rank provides an intuitive interface for building and distributing ranked lists.

## Features

- **Create Custom Rankings**: Build ranked lists for any topic with an intuitive drag-and-drop interface
- **Easy Sharing**: Share your rankings with others via unique URLs
- **Responsive Design**: Optimized for desktop and mobile devices
- **Fast Performance**: Built with Vite for lightning-fast load times and smooth interactions
- **Clean UI**: Minimalist design focused on usability and clarity

## Tech Stack

### Frontend
- **React** - Component-based UI library
- **Vite** - Fast build tool and development server
- **TypeScript** - Typed frontend code
- **Tailwind CSS** - Responsive styling with clean aesthetics

### Backend
- **C# / .NET** - Robust server-side API
- **EF Core** - SQLite for local development and PostgreSQL for production
- **Clerk** - Authentication and session management
- **RESTful API** - Clean communication between frontend and backend

## Architecture

The ASP.NET Core application serves the API and the built React app from one
process. During development, Vite runs separately and proxies `/api` requests
to the backend. The previous Supabase-based backend is retained in `legacy/`
for reference and is not compiled.


## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+, npm, and the .NET 8 SDK

### Installation

1. Install dependencies from the repository root:
```bash
npm install
```

2. Configure Clerk as described in `docs/clerkMigration.md`, including the
	publishable key, API public key, issuer, authorized origins, and session claims.

3. Start the backend and Vite development server:
```bash
npm run dev
```

4. Open `http://localhost:5173`. The API listens at `http://localhost:5033`.
	The npm server script expects the SDK at `~/.dotnet/dotnet`.

Local development defaults to SQLite (`simpleRank.dev.db`). To use a separate
local PostgreSQL database, set `DatabaseProvider=Postgres` and
`ConnectionStrings__DefaultConnection` to an Npgsql connection string before
starting the app. See `docs/deployNote.md` for deployment settings. Do not
point local development at production data.

The app currently uses EF Core `EnsureCreated()` on startup; it does not apply
schema migrations. Plan migrations and backups before changing a production
database schema.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run frontend tests
- `npm run typecheck` - Check frontend types
- `~/.dotnet/dotnet test SimpleRank.Tests/SimpleRank.Tests.csproj` - Run backend tests

For a single-process local build, run `npm run build` followed by
`~/.dotnet/dotnet run`. The backend serves the generated `wwwroot/` files.

## Usage

1. **Create a Ranking**: Click "Create New Ranking" and add your items
2. **Arrange Items**: Drag and drop items to set your preferred order
3. **Save & Share**: Save your ranking and get a shareable link
4. **View Rankings**: Access any shared ranking via its unique URL

## Project Structure

```
src/
├── components/         # Reusable React components
├── pages/              # Main application pages
├── contexts/           # Custom React Contexts
├── api/                # API communication layer
└── App.tsx             # Main application component
```

## API Integration

The frontend communicates with the C# backend through RESTful API endpoints:

The route contract is defined in `src/api/services.tsx` and implemented by the
controllers in `Controllers/`. Swagger is available at `/swagger` in development.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/lorfakl/simple-rank?tab=MIT-1-ov-file#readme) file for details.


---

*simple rank - for weirdos that just wanna rank things...that's literally it*
