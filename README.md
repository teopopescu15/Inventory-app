# Inventory Management System

A full-stack inventory management application with AI-powered analytics, built with Spring Boot and React.

## Features

- **Multi-tenant Architecture** - Complete data isolation between companies
- **Inventory Management** - Categories and products with image support
- **Order Processing** - Create, manage, and finalize orders
- **PDF Invoices** - Automatic invoice generation on order finalization
- **AI Analytics** - Powered by Google Gemini 3 Flash for inventory insights
- **Stock Tracking** - Complete audit trail of inventory changes
- **Modern UI** - Built with React, TypeScript, and Tailwind CSS

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Java 21, Spring Boot 3.5.7, Spring Security, JPA |
| Database | PostgreSQL 16 |
| AI | Google Gemini 3 Flash |
| Infrastructure | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Google Gemini API key (optional, for AI features)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Inventory-app
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (optional):

```bash
# Optional: For AI analysis features
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Launch with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:4201/api |
| Database | localhost:5433 |

### 5. Create an Account

1. Open http://localhost:4200
2. Click "Sign Up"
3. Enter your company details
4. Start managing your inventory

## Development Setup

### Backend (Spring Boot)

```bash
cd spring-app

# Create .env file
cp .env.template .env
# Edit .env with your configuration

# Run with Maven
./mvnw spring-boot:run
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database

```bash
# Start PostgreSQL only
docker-compose up -d database

# Connect with psql
psql -h localhost -p 5433 -U inventory -d inventory
```

## Project Structure

```
Inventory-app/
├── frontend/           # React frontend application
├── spring-app/         # Spring Boot backend application
├── docker-compose.yml  # Container orchestration
├── documentatie/       # Technical documentation
└── README.md           # This file
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/users/login` | Authenticate user |
| `POST /api/users` | Register new company |
| `GET /api/categories` | List categories |
| `GET /api/products` | List products |
| `GET /api/orders` | List orders |
| `POST /api/orders` | Create order |
| `POST /api/orders/{id}/finalize` | Finalize order |
| `GET /api/orders/{id}/invoice` | Download PDF invoice |
| `GET /api/analysis` | AI-powered analysis |

See [API Documentation](./documentatie/05-API-AUTH-DEPLOYMENT.md) for complete reference.

## Documentation

Comprehensive technical documentation is available in the `documentatie/` folder:

- [Documentation Index](./documentatie/00-INDEX.md)
- [Architecture Overview](./documentatie/01-ARCHITECTURE-OVERVIEW.md) - Tech stack, system architecture, folder structure
- [Backend Architecture](./documentatie/02-BACKEND-ARCHITECTURE.md)
- [Frontend Architecture](./documentatie/03-FRONTEND-ARCHITECTURE.md)
- [Database Schema](./documentatie/04-DATABASE-SCHEMA.md)
- [API, Auth & Deployment](./documentatie/05-API-AUTH-DEPLOYMENT.md)
- [AI Implementation](./documentatie/06-AI-IMPLEMENTATION.md)
- [Architecture Diagrams](./documentatie/07-DIAGRAMS.md)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | jdbc:postgresql://database:5432/inventory |
| `DB_USERNAME` | Database user | inventory |
| `DB_PASSWORD` | Database password | inventory123 |
| `JWT_SECRET` | JWT signing key (32+ chars) | - |
| `JWT_EXPIRATION` | Token validity in ms | 86400000 (24h) |
| `GEMINI_API_KEY` | Google Gemini API key | - |

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset database (destructive!)
docker-compose down -v
docker-compose up -d

# Access database shell
docker exec -it inventory-db psql -U inventory -d inventory
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   React     │────▶│ Spring Boot │
│             │     │  :4200      │     │   :4201     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │   Gemini    │◀────│  PostgreSQL │
                    │   AI API    │     │   :5433     │
                    └─────────────┘     └─────────────┘
```

## License

This project is proprietary software.
