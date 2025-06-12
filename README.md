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
- **JavaScript** - No TypeScript, keeping it simple
- **Tailwind CSS** - Responsive styling with clean aesthetics

### Backend
- **C# / .NET** - Robust server-side API
- **PostgreSQL** - Reliable data persistence
- **RESTful API** - Clean communication between frontend and backend

## Architecture

Simple Rank follows a modern, decoupled architecture:

- **Frontend**: Completely standalone React application that communicates with the backend via HTTP API calls
- **Backend**: Independent C# server providing RESTful endpoints for ranking data
- **Database**: PostgreSQL database for reliable data storage and retrieval


## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/simple-rank.git
cd simple-rank
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Usage

1. **Create a Ranking**: Click "Create New Ranking" and add your items
2. **Arrange Items**: Drag and drop items to set your preferred order
3. **Save & Share**: Save your ranking and get a shareable link
4. **View Rankings**: Access any shared ranking via its unique URL

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Main application pages
├── contexts/              # Custom React Contexts
├── services/           # API communication layer
└── App.jsx             # Main application component
```

## API Integration

The frontend communicates with the C# backend through RESTful API endpoints:

- `GET /api/rankings` - Retrieve rankings
- `POST /api/rankings` - Create new ranking  
- `GET /api/rankings/{id}` - Get specific ranking
- `PUT /api/rankings/{id}` - Update ranking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/lorfakl/simple-rank?tab=MIT-1-ov-file#readme) file for details.


---

*simple rank - for weirdos that just wanna rank things...that's literally it*
