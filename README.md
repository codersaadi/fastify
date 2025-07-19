# Fastify Starter API

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

A production-ready, feature-rich boilerplate for building robust and scalable APIs using Fastify and TypeScript. This starter kit comes with a pre-configured setup for authentication, database, testing, and more, allowing you to focus on writing your application logic.

## Features

- **Framework**: [Fastify](https://www.fastify.io/) for high-performance, low-overhead web framework.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety and better developer experience.
- **Authentication**: Integrated with [better-auth](https://www.npmjs.com/package/better-auth) for easy implementation of various OAuth providers (Google, GitHub, Discord, etc.).
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) for a modern, type-safe SQL query builder.
- **API Layer**: [tRPC](https://trpc.io/) for building end-to-end typesafe APIs without schemas or code generation.
- **Environment Variables**: Configuration management using `@fastify/env`.
- **Linting & Formatting**: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for consistent code style.
- **Testing**: [Vitest](https://vitest.dev/) for fast and reliable unit and integration testing.
- **Containerization**: [Docker](https://www.docker.com/) setup for development and production environments.
- **CI/CD**: [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) for pre-commit hooks.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/get-started)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd fastify-starter
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your configuration.

```bash
cp .env.example .env
```

### 4. Start the development database

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
pnpm run db:migrate
```

### 6. Start the development server

```bash
pnpm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

| Script              | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `build`             | Compiles the TypeScript code to JavaScript.            |
| `dev`               | Starts the development server with hot-reloading.      |
| `start`             | Starts the production server.                          |
| `lint`              | Lints the codebase using ESLint.                       |
| `lint:fix`          | Automatically fixes linting issues.                    |
| `format`            | Formats the code using Prettier.                       |
| `format:check`      | Checks for formatting issues.                          |
| `type-check`        | Runs TypeScript compiler to check for type errors.     |
| `test`              | Runs tests using Vitest.                               |
| `test:watch`        | Runs tests in watch mode.                              |
| `test:coverage`     | Generates a test coverage report.                      |
| `db:generate`       | Generates Drizzle ORM migration files.                 |
| `db:push`           | Pushes schema changes to the database (without migrations). |
| `db:migrate`        | Applies pending migrations to the database.            |
| `db:drop`           | Drops the database schema.                             |

## Project Structure

```
/
├── conf/               # Nginx configuration
├── docker/             # Docker-related files
├── src/
│   ├── auth/           # Authentication providers and configuration
│   ├── config/         # Environment variable configuration
│   ├── db/             # Drizzle ORM schema, client, and migrations
│   ├── decorators/     # Fastify decorators
│   ├── hooks/          # Fastify hooks
│   ├── plugins/        # Fastify plugins (auth, db, tRPC, etc.)
│   ├── routers/        # API route definitions (trpc )
│   ├── schema/         # Reusable Zod schemas
│   ├── types/          # Global type definitions
│   └── utils/          # Utility functions
├── .env.example        # Example environment variables
├── docker-compose.yaml # Docker Compose for development
├── Dockerfile          # Dockerfile for production
└── package.json        # Project dependencies and scripts
```

## Authentication

Authentication is handled by the `better-auth` library, providing a simple way to integrate OAuth providers.

- **Configuration**: `src/auth/auth.config.ts`
- **Providers**: Add or customize providers in `src/auth/providers/`.
- **Usage**: The `auth` decorator can be used to protect routes.

## API Documentation

API documentation is automatically generated using `@fastify/swagger`. Once the server is running, you can access the Swagger UI at `http://localhost:3000/documentation`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
