# Contributing to CertChain Africa

Thank you for your interest in contributing! This document covers everything you need to get started.

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Backend + Frontend |
| Rust | stable | Soroban contracts |
| Docker + Compose | latest | Local infrastructure |
| `stellar-cli` | latest | Contract deployment |

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install stellar-cli
cargo install stellar-cli --locked

# Install Node.js 20 (via nvm)
nvm install 20 && nvm use 20
```

## Local Setup

```bash
git clone https://github.com/vicistar-star/CertChain.git
cd CertChain

# 1. Start infrastructure
docker compose -f docker/docker-compose.yml up -d postgres redis ipfs

# 2. Backend
cd apps/backend
cp .env.example .env        # fill in Stellar keypairs + contract IDs
npm install
npm run migration:run
npm run start:dev            # http://localhost:3000
                             # Swagger: http://localhost:3000/api/docs

# 3. Frontend (new terminal)
cd apps/frontend
npm install
npm start                    # http://localhost:4200

# 4. Contracts (optional — only if changing Rust code)
cd contracts
cargo test --lib             # run unit tests
cargo build --target wasm32-unknown-unknown --release
```

## Project Structure

```
contracts/          Soroban smart contracts (Rust)
apps/backend/       NestJS API
apps/frontend/      Angular 17 PWA
docker/             Docker Compose + Dockerfiles
docs/               Architecture notes
.github/workflows/  CI/CD pipeline
```

## Branching

| Branch | Purpose |
|---|---|
| `main` | Production-ready, protected |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling, deps, docs |

```bash
git checkout develop
git checkout -b feature/your-feature
# make changes + write tests
git push origin feature/your-feature
# open PR against develop
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(contracts): add license renewal function
fix(backend): handle expired credential status correctly
chore(frontend): upgrade Angular to 17.3
docs: update verification flow diagram
test(backend): add e2e tests for bulk issuance
```

## Running Tests

```bash
# Contracts
cd contracts && cargo test --lib

# Backend unit tests
cd apps/backend && npm test

# Backend with coverage
cd apps/backend && npm run test:cov

# Frontend
cd apps/frontend && npm test
```

## Pull Request Checklist

- [ ] Tests pass locally (`cargo test --lib`, `npm test`)
- [ ] New code has corresponding tests
- [ ] No secrets or `.env` values committed
- [ ] Commit messages follow Conventional Commits
- [ ] PR targets `develop`, not `main`

## Areas Needing Contribution

See open issues. High-priority areas:

- **Graduate share/QR component** — `apps/frontend/src/app/features/graduate/share/`
- **PDF certificate export** — `jsPDF` integration
- **Bulk CSV upload UI** — institution portal
- **NgRx effects** — wire up async actions
- **E2E tests** — Playwright for frontend
- **USSD gateway** — Africa's Talking integration
- **Webhook API** — ATS/HR system integration

## Questions?

Open a GitHub Discussion or reach out via the issue tracker.
