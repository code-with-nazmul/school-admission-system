# School Admission System

A robust, concurrent First-Come, First-Served (FCFS) online school admission engine featuring temporary seat holds, live countdown timers, payment confirmation, and automated seat release.

---

## ১. Docker দিয়ে App চালানোর ধাপ (Running with Docker)

The entire application (PostgreSQL database, backend API, and frontend portal) is fully dockerized. **No software other than Docker is required on your machine.**

### Step 1: Clone the repository and navigate to the project root
```bash
git clone <your-repository-url>
cd <repository-folder>
```

### Step 2: Build and start all services
From the repository root (where `docker-compose.yml` is located), run:
```bash
docker compose up --build
```
*(Or run `docker compose up -d --build` to start in detached background mode).*

This single command automatically starts all 3 services:
1. **`db`** (`postgres:16-alpine`): Initializes PostgreSQL on port `5432` with a persistent named volume.
2. **`backend`** (`ASP.NET Core 8`): Automatically waits for database health checks, initializes tables and sequences (`class_seq`, `hold_seq`), and listens on port `8080`.
3. **`frontend`** (`React 18 + Vite + Nginx`): Builds the TypeScript SPA and serves it via Nginx on port `3000`.

### Step 3: Stop the application
When finished, press `Ctrl + C` or run:
```bash
docker compose down
```
*(All data is persisted in the `postgres_data` volume and will not be lost across restarts).*

---

## ২. Frontend ও Backend URL (Access URLs)

Once Docker Compose finishes starting the containers:

| Service | Access URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | [http://localhost:3000](http://localhost:3000) | Responsive React UI for both Student and Admin roles |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | ASP.NET Core REST API base URL |
| **Live API Check** | [http://localhost:8080/classes](http://localhost:8080/classes) | Returns live JSON list of classes and real-time seat counts |

---

## ৩. Test চালানোর নিয়ম (Running Automated Tests)

### Backend Automated Tests (xUnit)
The backend test suite includes **13 unit, integration, and concurrency tests** located in `backend/tests/SchoolAdmission.Tests/`:
- **Concurrency Test**: 40 simultaneous parallel tasks compete for 5 seats to prove zero oversubscription (`held + confirmed <= totalSeats`) under heavy race conditions.
- **Hold & Class Service Tests**: Validates seat calculations, 10-minute hold expiration, payment idempotency, and 17-digit student identity rules.

#### Option A: Running with .NET 8+ SDK (Host Machine)
```bash
dotnet test backend/SchoolAdmission.sln
```

#### Option B: Running via Docker (No .NET SDK required on host)
```bash
docker run --rm -v "$(pwd)/backend:/app" -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet test SchoolAdmission.sln
```

---

### Frontend Automated Tests (Vitest + React Testing Library)
The frontend test suite includes **16 component tests** located in `frontend/src/test/`:
- **Rule 9**: Hold countdown expiration and disabling the payment button without page reload.
- **Rule 11**: 17-digit numeric birth registration input validation and demo ID autofill.
- **Seat States**: Metric displays, full class disabled state, confirmed admission badges, and action buttons.
- **Application History**: Table rendering and permanent admission labels.

To run the frontend tests:
```bash
cd frontend
npm test
```

---

## ৪. Tech Stacks

- **Backend**:
  - Language: C# / .NET 8 (`net8.0`)
  - Framework: ASP.NET Core Web API (Controllers)
  - ORM & Data: Entity Framework Core 8 (`Npgsql.EntityFrameworkCore.PostgreSQL 8.0.4`)
  - Concurrency Safety: PostgreSQL Pessimistic Row Locking (`SELECT ... FOR UPDATE`)
  - Testing: xUnit 2.9, Microsoft.NET.Test.Sdk
- **Database**:
  - PostgreSQL 16 Alpine
  - Native Sequences: `class_seq`, `hold_seq`
- **Frontend**:
  - Framework: React 18.3 (`react`, `react-dom`)
  - Language: TypeScript 5.6
  - Bundler & Tooling: Vite 5.4 (`@vitejs/plugin-react`)
  - Styling: Tailwind CSS 3.4
  - Icons: Lucide React
  - Production Web Server: Nginx Alpine
  - Testing: Vitest 2.1, @testing-library/react, @testing-library/jest-dom, jsdom
- **Orchestration**:
  - Root `docker-compose.yml` with health checks, dependencies, and persistent volumes.

---

## ৫. Environment Variables Reference

| Variable | Default Value | Service | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `Host=db;Port=5432;Database=school_admission_db;Username=postgres;Password=postgres` | `backend` | PostgreSQL connection string (supports ADO.NET and `postgres://` URI formats). |
| `HOLD_DURATION_SECONDS` | `600` | `backend` | Default duration (in seconds) for temporary seat holds (Rule 2). |
| `VITE_API_URL` | `http://localhost:8080` | `frontend` | Backend base URL for frontend API calls. Dynamically injected at runtime via Nginx entrypoint. |

---

## ৬. Project Structure

```text
.
├── backend/
│   ├── SchoolAdmission.sln
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   │   └── SchoolAdmission.Api/
│   │       ├── Controllers/          # ClassesController, HoldsController, MeController
│   │       ├── Data/                 # SchoolAdmissionDbContext, Entities (ClassEntity, HoldEntity)
│   │       ├── DTOs/                 # Request & Response Contracts
│   │       ├── Exceptions/           # Domain Exceptions (Validation, NotFound, Conflict, Forbidden)
│   │       ├── Middleware/           # ExceptionHandlingMiddleware (Strict 4xx, never 500)
│   │       ├── Services/             # ClassService, HoldService (FOR UPDATE Locking), IdGenerator
│   │       ├── Validators/           # StudentIdValidator (17-digit numeric regex)
│   │       ├── Workers/              # HoldExpirationWorker (10s background sweeper)
│   │       └── Program.cs            # Schema bootstrap, Sequences & App Pipeline
│   └── tests/
│       └── SchoolAdmission.Tests/    # 13 xUnit Tests (ConcurrencyTests, HoldServiceTests, etc.)
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf                    # Nginx Alpine web server configuration
│   ├── 40-env-config.sh              # Runtime VITE_API_URL dynamic injector
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── api/                      # client.ts (API client with dynamic env fallback)
│   │   ├── components/               # Navbar, StudentLogin, ClassCard, ActiveHoldCard, AdminDashboard, etc.
│   │   ├── test/                     # 16 Vitest & React Testing Library automated tests
│   │   ├── types/                    # TypeScript interfaces & types
│   │   ├── App.tsx                   # Main SPA with real-time 3s auto-polling
│   │   └── main.tsx
│   └── public/                       # Static public assets & env config template
│
├── docker-compose.yml                # Root multi-container orchestration
├── ASSUMPTIONS.md                    # Explicit design choices, identity validation, & concurrency
├── AI_USAGE.md                       # AI usage disclosure, mistakes caught, & human corrections
└── README.md                         # Run instructions, access URLs, and testing rules
```

