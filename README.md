# Property Management Communication Platform (Backend)

This repository contains a production-ready NestJS backend blueprint following a modular-monolith architecture.

## Features Included

- TypeScript + NestJS 10
- PostgreSQL via TypeORM
- JWT authentication (access + refresh)
- Config module with environment validation
- User model + role constants
- Ticket CRUD + assignment workflow
- WebSocket chat gateway
- Document upload endpoint

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── constants/
│   │   └── roles.constant.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── env.validation.ts
│   └── jwt.config.ts
├── database/
│   └── entities/
│       ├── message.entity.ts
│       ├── ticket.entity.ts
│       └── user.entity.ts
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── logout.dto.ts
    │   │   ├── refresh-token.dto.ts
    │   │   └── register.dto.ts
    │   └── strategies/
    │       └── jwt.strategy.ts
    └── users/
        ├── users.controller.ts
        ├── users.module.ts
        └── users.service.ts
    ├── tickets/
    │   ├── dto/
    │   │   ├── assign-ticket.dto.ts
    │   │   ├── create-ticket.dto.ts
    │   │   ├── update-status.dto.ts
    │   │   └── update-ticket.dto.ts
    │   ├── tickets.controller.ts
    │   ├── tickets.module.ts
    │   └── tickets.service.ts
    ├── messages/
    │   ├── dto/
    │   │   └── send-message.dto.ts
    │   ├── messages.gateway.ts
    │   └── messages.module.ts
    └── documents/
        ├── documents.controller.ts
        └── documents.module.ts
```

## Environment Configuration

Copy the example file and adjust values:

```bash
cp .env.example .env
```

## Database Setup (PostgreSQL)

1. Start a PostgreSQL instance (Docker example):

```bash
docker run --name property-manager-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=property_manager -p 5432:5432 -d postgres:15
```

2. Apply the schema:

```bash
psql -h localhost -U postgres -d property_manager -f docs/schema.sql
```

## Running the API

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000/api/v1` by default. Authentication endpoints live under `/auth/*`, and ticket routes are under `/tickets/*`.

## WebSocket Chat

Connect to `ws://localhost:3000/chat` using Socket.io and pass a JWT access token as `auth.token` during the handshake. Ticket rooms use the `ticket:{ticketId}` naming convention.

## Notes

- Refresh tokens are stored in-memory as a placeholder for Redis.
- `TypeORM` synchronization is disabled by default; add migrations for schema setup.
