# Inventory-App Technical Documentation

## Overview

Inventory-App is a full-stack inventory management system with AI-powered analytics. It enables businesses to manage their product inventory, process orders, generate invoices, and gain AI-driven insights into their inventory health.

## Documentation Index

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE-OVERVIEW.md](./01-ARCHITECTURE-OVERVIEW.md) | Tech stack, system architecture, and folder structure |
| [02-BACKEND-ARCHITECTURE.md](./02-BACKEND-ARCHITECTURE.md) | Spring Boot backend implementation details |
| [03-FRONTEND-ARCHITECTURE.md](./03-FRONTEND-ARCHITECTURE.md) | React frontend implementation details |
| [04-DATABASE-SCHEMA.md](./04-DATABASE-SCHEMA.md) | Database design and entity relationships |
| [05-API-AUTH-DEPLOYMENT.md](./05-API-AUTH-DEPLOYMENT.md) | REST API, Authentication & Deployment |
| [06-AI-IMPLEMENTATION.md](./06-AI-IMPLEMENTATION.md) | Google Gemini AI integration |
| [07-DIAGRAMS.md](./07-DIAGRAMS.md) | All Mermaid diagrams for export |

## Quick Reference

### Key Features
- Multi-tenant inventory management (company-isolated data)
- Category and product management with image support
- Order processing with PENDING/FINALIZED workflow
- PDF invoice generation
- AI-powered inventory analysis (Google Gemini 3 Flash)
- Product stock history tracking
- JWT-based authentication

### System Ports
| Service | Port |
|---------|------|
| Frontend (React) | 4200 |
| Backend (Spring Boot) | 4201 |
| PostgreSQL Database | 5433 |

### Quick Start
See the main [README.md](../README.md) in the project root for setup and launch instructions.

## Tech Stack Summary

**Backend:**
- Java 21, Spring Boot 3.5.7
- PostgreSQL 16
- JJWT 0.11.5 (JWT tokens)
- iText7 7.2.5 (PDF generation)
- Google GenAI SDK 1.32.0 (Gemini AI)

**Frontend:**
- React 19.2.0, TypeScript 5.9.3
- Vite 7.2.2
- Tailwind CSS 4.1.17
- Radix UI (shadcn/ui style)
- TanStack React Table v8.21.3
- Axios 1.13.2

**Infrastructure:**
- Docker Compose
- PostgreSQL container (port 5433)
- Backend container (port 4201)
- Frontend container (port 4200)
