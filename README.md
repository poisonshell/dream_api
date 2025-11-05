# Dream API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (or Colima on macOS)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set your ADMIN_INVITATION_CODE and JWT_SECRET
```

3. Start development server (Docker + API):
```bash
npm run dev
```

This will:
- Start PostgreSQL in Docker automatically
- Wait for the database to be ready
- Run pending migrations
- Start the development server with hot reload

The GraphQL Playground will be available at `http://localhost:4000/graphql`

