# Medwait: Ontario ED Wait-Time Aggregator

A robust, observable MVP for tracking Ontario Emergency Department wait times and routing users to the optimal facility.

## Tech Stack
- **Frontend**: Next.js (App Router), Vanilla CSS, Framer Motion
- **API**: Fastify, Zod, Drizzle ORM
- **Scraper**: Node.js, Cheerio, Playwright (fallback)
- **Database**: PostgreSQL (Migrations via Drizzle Kit)
- **Shared**: Zod types across workspace

## Local Setup

### 1. Prerequisites
- Docker & Docker Compose
- Node.js >= 20
- pnpm (if not installed, the project uses a local copy)

### 2. Infrastructure
```bash
docker-compose up -d
```

### 3. Environment Variables
Create a `.env` in the root:
```
DATABASE_URL=postgres://user:password@localhost:5432/medwait
LOG_LEVEL=info
```

### 4. Initialization
```bash
npm run install:all
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start Development
```bash
# Start API
pnpm --filter @medwait/api dev

# Start Web UI
pnpm --filter @medwait/web dev

# Run Scraper Once
pnpm --filter @medwait/scraper start
```

## Scraper Adapter System
Each hospital in `data/ontario_hospitals_seed.csv` is mapped to an `adapter_key`.
Available adapters:
- `uhn_generic`: Specifically for UHN sites.
- `generic_selector`: CSS-based extraction (configurable).
- `regex_pattern`: Pattern-based extraction.
- `json_endpoint`: Direct API consumption.

### Adding a New Hospital
1. Add the entry to `data/ontario_hospitals_seed.csv`.
2. Map it to an existing `adapter_key` or create a new one in `services/scraper/lib/registry.ts`.
3. Run `npm run db:seed`.

## Backtesting & Tuning
The "fix loop" helps maintain accuracy as hospital websites change.

### Run Backtest
Validates scrapers against stored HTML fixtures in `fixtures/`.
```bash
npm run backtest
```

### Run Tuning
Generates a failure report and guided checklist.
```bash
npm run tune
```

## Disclaimer
**This is an informational tool only.** If you are experiencing a life-threatening emergency, call 911 immediately. No medical advice is provided.
