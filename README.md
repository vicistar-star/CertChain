# 🎓 CertChain Africa — Decentralized Credential Verification on Stellar

> Tamper-proof academic and professional credentials for Africa — issued by institutions, owned by graduates, verified by anyone in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Stellar Network](https://img.shields.io/badge/Stellar-Testnet%20%7C%20Mainnet-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple)](https://soroban.stellar.org)
[![Angular](https://img.shields.io/badge/Angular-17+-red)](https://angular.io)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red)](https://nestjs.com)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Stellar & Soroban Integration](#stellar--soroban-integration)
- [Smart Contracts (Soroban)](#smart-contracts-soroban)
- [Backend — NestJS](#backend--nestjs)
- [Frontend — Angular](#frontend--angular)
- [Verification Flow](#verification-flow)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**CertChain Africa** is a full-stack decentralized credential verification platform built on the Stellar blockchain. It enables accredited institutions — universities, polytechnics, professional bodies, and vocational training centres — to issue tamper-proof digital credentials that graduates own in a self-sovereign wallet and share with employers via a single verifiable link.

No central database to hack. No institution phone calls. No waiting weeks for a verification letter. A credential either exists on the Stellar ledger, signed by a registered institution, or it doesn't.

---

## Problem Statement

| Problem | Impact | CertChain Response |
|---|---|---|
| Forged degrees on CVs | ~30% of Nigerian CVs contain fake credentials | On-chain credentials are cryptographically unforgeable |
| Slow manual verification | Weeks to months per request | Instant public-key verification — no institution contact needed |
| Closed/unreachable institutions | Historical records permanently lost | Ledger is permanent; institution closure doesn't erase records |
| Cross-border hiring friction | Intra-Africa mobility blocked | No geographic borders on Stellar |
| Students lack credential custody | Institutions gatekeep their own records | Non-custodial wallet — student owns their credentials |
| Counterfeit professional licenses | Fake doctors, engineers, lawyers practice unchecked | License tokens with expiry + renewal on-chain |
| No revocation mechanism | Expelled students keep valid-looking papers | Soroban revocation registry; verifiers always see live status |

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                     │
│                                                                             │
│  Institution Portal (Angular)   Graduate Wallet (Angular PWA)              │
│  Employer Verifier (Angular)     Public Verify Page (no login)             │
└──────────────────┬──────────────────────────────────┬───────────────────────┘
                   │ REST / WebSocket                  │ REST
┌──────────────────▼──────────────────────────────────▼───────────────────────┐
│                            BACKEND LAYER (NestJS)                           │
│                                                                             │
│  Auth  │  Institutions  │  Credentials  │  Verification  │  Notifications  │
│                                                                             │
│  Stellar Service  │  Soroban Service  │  IPFS Service  │  Queue (BullMQ)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Stellar SDK / Soroban RPC
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         STELLAR NETWORK (Testnet / Mainnet)                 │
│                                                                             │
│  SCP Ledger  │  Soroban Contracts  │  Stellar Accounts  │  Transactions    │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐   │
│  │ Institution      │  │ Credential Token │  │ Revocation Registry    │   │
│  │ Registry         │  │ Contract         │  │ Contract               │   │
│  └──────────────────┘  └──────────────────┘  └────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            STORAGE LAYER                                    │
│                                                                             │
│  IPFS (credential metadata)   PostgreSQL (off-chain index)   Redis (cache) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Angular 17+ (standalone components, signals) |
| State management | NgRx (signals-based store) |
| Styling | Tailwind CSS + Angular Material |
| Stellar SDK | `@stellar/stellar-sdk` (browser bundle) |
| Wallet | Freighter wallet extension + in-app custodial wallet |
| PWA | `@angular/pwa` (installable on Android/iOS) |
| QR codes | `angularx-qrcode` |
| i18n | `@angular/localize` (English, French, Swahili, Hausa, Amharic) |
| PDF generation | `jsPDF` (printable credential certificates) |

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS 10+ |
| Runtime | Node.js 20 LTS |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis + BullMQ |
| ORM | TypeORM |
| Stellar SDK | `@stellar/stellar-sdk` (Node) |
| Soroban RPC | `@stellar/stellar-sdk` Soroban client |
| File storage | IPFS via `kubo-rpc-client` (credential metadata) |
| Auth | JWT + Stellar SEP-10 keypair authentication |
| Email | Nodemailer + SendGrid |
| SMS | Africa's Talking API |
| API docs | Swagger / OpenAPI 3.1 |
| Testing | Jest + Supertest |

### Blockchain
| Layer | Technology |
|---|---|
| Network | Stellar (Testnet dev, Mainnet prod) |
| Smart contracts | Soroban (Rust) |
| Contract toolchain | `stellar-cli`, `soroban-sdk` |
| Transaction fees | ~$0.00001 per credential issuance |

### Infrastructure
| Layer | Technology |
|---|---|
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS ECS (prod) / Docker (dev) |
| CDN | CloudFront (frontend assets) |
| Monitoring | Grafana + Prometheus |

---

## Project Structure

```
certchain-africa/
│
├── apps/
│   ├── frontend/                           # Angular application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/
│   │   │   │   │   ├── guards/             # Auth, role guards
│   │   │   │   │   ├── interceptors/       # JWT, error handling
│   │   │   │   │   └── services/           # Wallet, auth, http
│   │   │   │   ├── features/
│   │   │   │   │   ├── auth/               # Login, register (institution + student)
│   │   │   │   │   ├── institution/
│   │   │   │   │   │   ├── dashboard/      # Issuance stats, recent activity
│   │   │   │   │   │   ├── issue/          # Single + bulk credential issuance
│   │   │   │   │   │   ├── manage/         # Revoke, update credentials
│   │   │   │   │   │   └── templates/      # Credential template builder
│   │   │   │   │   ├── graduate/
│   │   │   │   │   │   ├── wallet/         # View owned credentials
│   │   │   │   │   │   ├── share/          # Generate shareable links + QR codes
│   │   │   │   │   │   └── profile/        # Identity + linked credentials
│   │   │   │   │   ├── verify/             # Public verifier (no login required)
│   │   │   │   │   └── marketplace/        # Job board (future)
│   │   │   │   ├── shared/
│   │   │   │   │   ├── components/         # Credential card, badge, QR viewer
│   │   │   │   │   ├── pipes/              # Truncate address, format date
│   │   │   │   │   └── directives/
│   │   │   │   └── store/                  # NgRx slices
│   │   │   │       ├── auth/
│   │   │   │       ├── credentials/
│   │   │   │       └── institution/
│   │   │   ├── assets/
│   │   │   └── environments/
│   │   └── package.json
│   │
│   └── backend/                            # NestJS application
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/                   # SEP-10 + JWT auth
│       │   │   ├── institutions/           # Institution registry + profiles
│       │   │   ├── credentials/            # Issuance, revocation, queries
│       │   │   ├── verification/           # Public verification endpoint
│       │   │   ├── graduates/              # Graduate profiles + wallets
│       │   │   ├── templates/              # Credential template management
│       │   │   └── notifications/          # Email, SMS, push
│       │   ├── stellar/
│       │   │   ├── stellar.service.ts      # Core Stellar SDK wrapper
│       │   │   ├── soroban.service.ts      # Soroban contract invocation
│       │   │   └── stellar.module.ts
│       │   ├── ipfs/
│       │   │   ├── ipfs.service.ts         # Store/retrieve credential metadata
│       │   │   └── ipfs.module.ts
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   └── pipes/
│       │   ├── config/
│       │   └── main.ts
│       └── package.json
│
├── contracts/                              # Soroban smart contracts (Rust)
│   ├── institution-registry/               # Accredited institution identities
│   ├── credential-token/                   # Individual credential NFT-like tokens
│   ├── revocation-registry/                # Revoked credential tracking
│   └── batch-issuer/                       # Gas-efficient bulk issuance
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfiles
│
├── docs/
│   ├── architecture.md
│   ├── stellar-integration.md
│   ├── verification-flow.md
│   └── api/
│
└── README.md
```

---

## Core Features

### For Institutions
- **Institutional identity registration** — anchor institution identity on Stellar, verified against national accreditation bodies (NUC, WAEC, NBTE, KNQA, NAB etc.)
- **Credential template builder** — define reusable templates per credential type (BSc, MSc, Diploma, Certificate, Professional License)
- **Single issuance** — issue one credential to a graduate with full metadata
- **Bulk issuance** — upload a graduation CSV and mint credentials for an entire cohort in one batch transaction
- **Revocation** — instantly revoke credentials (expulsion, fraud, honorary stripping); verifiers see updated status in real time
- **Analytics dashboard** — total issued, verified, revoked; verification requests by country
- **License renewal workflow** — professional licenses with expiry dates and on-chain renewal

### For Graduates
- **Self-sovereign wallet** — credential tokens are owned by the graduate's Stellar account, not the institution
- **Credential collection** — hold credentials from multiple institutions in one wallet
- **Shareable verification links** — generate a unique URL and QR code per credential; share with any employer globally
- **PDF certificate export** — beautifully branded printable certificate backed by on-chain verification
- **Selective disclosure** — share only what's needed (e.g. degree class, not full transcript)
- **USSD access** — feature phone users can retrieve their verification link via USSD

### For Employers / Verifiers
- **Zero-login verification** — visit `certchain.africa/verify/{id}` with no account needed
- **Instant cryptographic proof** — institution name, credential type, graduate name, issue date, and status in under 2 seconds
- **Bulk verification** — upload a list of credential IDs; get a report for an entire candidate pool
- **Webhook integration** — plug CertChain verification into existing ATS/HR systems via REST webhook
- **Verification audit trail** — see how many times and from where a credential has been verified

### For Regulators / Accreditation Bodies
- **Institution audit view** — all credentials issued by any registered institution
- **Accreditation status management** — link on-chain institution status to real-world accreditation
- **Deaccreditation** — removing accreditation status halts future issuance (existing valid credentials remain)

---

## Stellar & Soroban Integration

### Why Stellar for Credentials

| Requirement | Stellar Solution |
|---|---|
| Permanent, tamper-proof records | SCP ledger — immutable by design |
| Institution issues credential once | Soroban contract mints a unique record |
| Employer verifies in seconds | Public-key lookup — no institution API needed |
| Student controls their own record | Non-custodial Stellar wallet |
| Cross-border recognition | No geographic borders on Stellar |
| Revocation in real time | Soroban revocation registry |
| Negligible issuance cost | ~$0.00001 per transaction |

### Stellar Service

```typescript
// stellar/stellar.service.ts
import {
  Keypair, Networks, TransactionBuilder,
  Operation, Memo, Horizon,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private server: Horizon.Server;
  private networkPassphrase: string;

  constructor(private config: ConfigService) {
    const isTestnet = config.get('STELLAR_NETWORK') === 'testnet';
    this.server = new Horizon.Server(
      isTestnet
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org',
    );
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  generateKeypair(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  }

  async fundTestnetAccount(publicKey: string): Promise<void> {
    await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  }

  // SEP-10 Web Auth: build challenge transaction
  async buildChallengeTransaction(clientPublicKey: string): Promise<string> {
    const serverAccount = await this.server.loadAccount(
      this.config.get('STELLAR_SERVER_PUBLIC_KEY'),
    );
    const transaction = new TransactionBuilder(serverAccount, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `certchain-africa auth`,
          value: randomBytes(48).toString('base64'),
          source: clientPublicKey,
        }),
      )
      .setTimeout(300)
      .build();

    const serverKeypair = Keypair.fromSecret(
      this.config.get('STELLAR_SERVER_SECRET_KEY'),
    );
    transaction.sign(serverKeypair);
    return transaction.toEnvelope().toXDR('base64');
  }

  async verifyChallengeTransaction(
    signedXdr: string,
    clientPublicKey: string,
  ): Promise<boolean> {
    try {
      const transaction = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
      const keypair = Keypair.fromPublicKey(clientPublicKey);
      return transaction.signatures.some(sig =>
        keypair.verify(transaction.hash(), sig.signature()),
      );
    } catch {
      return false;
    }
  }
}
```

### Soroban Service

```typescript
// stellar/soroban.service.ts
import {
  Contract, SorobanRpc, TransactionBuilder,
  scValToNative, nativeToScVal, Networks, Keypair,
} from '@stellar/stellar-sdk';

@Injectable()
export class SorobanService {
  private rpc: SorobanRpc.Server;

  constructor(private config: ConfigService) {
    this.rpc = new SorobanRpc.Server(config.get('STELLAR_RPC_URL'), {
      allowHttp: config.get('STELLAR_NETWORK') === 'testnet',
    });
  }

  async invokeContract<T = unknown>({
    contractId, method, args, signerSecret,
  }: InvokeContractParams): Promise<T> {
    const contract = new Contract(contractId);
    const keypair = Keypair.fromSecret(signerSecret);
    const account = await this.rpc.getAccount(keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: this.config.get('STELLAR_NETWORK') === 'testnet'
        ? Networks.TESTNET : Networks.PUBLIC,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const prepared = SorobanRpc.assembleTransaction(tx, sim).build();
    prepared.sign(keypair);

    const sent = await this.rpc.sendTransaction(prepared);
    if (sent.status === 'ERROR') throw new Error(`Submit failed: ${sent.errorResult}`);

    // Poll for confirmation
    let result = await this.rpc.getTransaction(sent.hash);
    while (result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise(r => setTimeout(r, 1000));
      result = await this.rpc.getTransaction(sent.hash);
    }
    if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain');
    }

    return scValToNative(result.returnValue) as T;
  }

  async queryContract<T = unknown>({
    contractId, method, args, callerPublicKey,
  }: QueryContractParams): Promise<T> {
    const contract = new Contract(contractId);
    const account = await this.rpc.getAccount(callerPublicKey);

    const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(`Query failed: ${sim.error}`);
    return scValToNative(sim.result.retval) as T;
  }
}
```

---

## Smart Contracts (Soroban)

All contracts are written in Rust using `soroban-sdk`, compiled to WASM, and deployed to Stellar.

### 1. Institution Registry Contract

Maintains the authoritative on-chain registry of accredited institutions.

```rust
// contracts/institution-registry/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub enum InstitutionStatus { Active, Suspended, Deaccredited }

#[contracttype]
#[derive(Clone)]
pub struct Institution {
    pub id: u64,
    pub stellar_address: Address,
    pub name: String,
    pub country_code: String,
    pub accreditation_body: String,
    pub accreditation_id: String,
    pub institution_type: Symbol,     // "UNIVERSITY" | "POLYTECHNIC" | "VOCATIONAL" | "PROFESSIONAL"
    pub website: String,
    pub status: InstitutionStatus,
    pub registered_ledger: u32,
    pub credentials_issued: u64,
}

#[contract]
pub struct InstitutionRegistry;

#[contractimpl]
impl InstitutionRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("inst_ct"), &0u64);
    }

    pub fn register_institution(
        env: Env,
        admin: Address,
        stellar_address: Address,
        name: String,
        country_code: String,
        accreditation_body: String,
        accreditation_id: String,
        institution_type: Symbol,
        website: String,
    ) -> u64 {
        let stored_admin: Address = env.storage().instance()
            .get(&symbol_short!("admin")).unwrap();
        stored_admin.require_auth();

        let id: u64 = env.storage().instance()
            .get(&symbol_short!("inst_ct")).unwrap_or(0u64) + 1;

        let institution = Institution {
            id,
            stellar_address: stellar_address.clone(),
            name,
            country_code,
            accreditation_body,
            accreditation_id,
            institution_type,
            website,
            status: InstitutionStatus::Active,
            registered_ledger: env.ledger().sequence(),
            credentials_issued: 0,
        };

        env.storage().persistent().set(&id, &institution);
        env.storage().persistent().set(&stellar_address, &id);
        env.storage().instance().set(&symbol_short!("inst_ct"), &id);

        env.events().publish(
            (symbol_short!("INST"), symbol_short!("REGISTERED")),
            (id, stellar_address),
        );
        id
    }

    pub fn is_active(env: Env, address: Address) -> bool {
        if let Some(id) = env.storage().persistent().get::<Address, u64>(&address) {
            let inst: Institution = env.storage().persistent().get(&id).unwrap();
            matches!(inst.status, InstitutionStatus::Active)
        } else {
            false
        }
    }

    pub fn get_institution_by_address(env: Env, address: Address) -> Institution {
        let id: u64 = env.storage().persistent().get(&address).expect("Not found");
        env.storage().persistent().get(&id).unwrap()
    }

    pub fn suspend_institution(env: Env, admin: Address, institution_id: u64) {
        let stored_admin: Address = env.storage().instance()
            .get(&symbol_short!("admin")).unwrap();
        stored_admin.require_auth();
        let mut inst: Institution = env.storage().persistent().get(&institution_id).unwrap();
        inst.status = InstitutionStatus::Suspended;
        env.storage().persistent().set(&institution_id, &inst);
    }

    pub fn increment_issued(env: Env, institution_address: Address) {
        let id: u64 = env.storage().persistent().get(&institution_address).unwrap();
        let mut inst: Institution = env.storage().persistent().get(&id).unwrap();
        inst.credentials_issued += 1;
        env.storage().persistent().set(&id, &inst);
    }
}
```

### 2. Credential Token Contract

The core contract. Each credential is a unique on-chain record tied to a specific graduate's Stellar address and signed by a verified institution. Credentials are **soul-bound** — they cannot be transferred.

```rust
// contracts/credential-token/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub enum CredentialStatus { Valid, Revoked, Expired }

#[contracttype]
#[derive(Clone)]
pub struct Credential {
    pub id: u64,
    pub institution: Address,
    pub graduate: Address,
    pub credential_type: Symbol,       // "BACHELORS" | "MASTERS" | "PHD" | "DIPLOMA" | "CERTIFICATE" | "LICENSE"
    pub field_of_study: String,
    pub title: String,
    pub grade: String,
    pub issue_date_unix: u64,
    pub expiry_date_unix: u64,         // 0 = no expiry; set for professional licenses
    pub metadata_ipfs_hash: String,    // IPFS CID for full metadata + institution branding
    pub verification_count: u64,
    pub status: CredentialStatus,
    pub issued_ledger: u32,
    pub revoked_ledger: u32,
    pub revocation_reason: String,
}

#[contract]
pub struct CredentialToken;

#[contractimpl]
impl CredentialToken {
    pub fn initialize(
        env: Env,
        admin: Address,
        registry_contract: Address,
        revocation_contract: Address,
    ) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("registry"), &registry_contract);
        env.storage().instance().set(&symbol_short!("revoc"), &revocation_contract);
        env.storage().instance().set(&symbol_short!("cred_ct"), &0u64);
    }

    pub fn issue(
        env: Env,
        institution: Address,
        graduate: Address,
        credential_type: Symbol,
        field_of_study: String,
        title: String,
        grade: String,
        issue_date_unix: u64,
        expiry_date_unix: u64,
        metadata_ipfs_hash: String,
    ) -> u64 {
        institution.require_auth();

        // Verify institution is active in registry
        let registry_id: Address = env.storage().instance()
            .get(&symbol_short!("registry")).unwrap();
        let registry_client = InstitutionRegistryClient::new(&env, &registry_id);
        assert!(registry_client.is_active(&institution), "Institution not accredited");

        let id: u64 = env.storage().instance()
            .get(&symbol_short!("cred_ct")).unwrap_or(0u64) + 1;

        let credential = Credential {
            id,
            institution: institution.clone(),
            graduate: graduate.clone(),
            credential_type,
            field_of_study,
            title,
            grade,
            issue_date_unix,
            expiry_date_unix,
            metadata_ipfs_hash,
            verification_count: 0,
            status: CredentialStatus::Valid,
            issued_ledger: env.ledger().sequence(),
            revoked_ledger: 0,
            revocation_reason: String::from_str(&env, ""),
        };

        env.storage().persistent().set(&id, &credential);
        env.storage().instance().set(&symbol_short!("cred_ct"), &id);

        // Append to graduate's credential list
        let mut grad_creds: soroban_sdk::Vec<u64> = env
            .storage().persistent().get(&graduate)
            .unwrap_or(soroban_sdk::vec![&env]);
        grad_creds.push_back(id);
        env.storage().persistent().set(&graduate, &grad_creds);

        registry_client.increment_issued(&institution);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("ISSUED")),
            (id, institution, graduate),
        );
        id
    }

    pub fn verify(env: Env, credential_id: u64) -> Credential {
        let mut credential: Credential = env.storage().persistent()
            .get(&credential_id).expect("Credential not found");

        // Auto-flag if expired
        if credential.expiry_date_unix > 0
            && env.ledger().timestamp() > credential.expiry_date_unix
        {
            credential.status = CredentialStatus::Expired;
        }

        credential.verification_count += 1;
        env.storage().persistent().set(&credential_id, &credential);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("VERIFIED")),
            credential_id,
        );
        credential
    }

    pub fn revoke(env: Env, institution: Address, credential_id: u64, reason: String) {
        institution.require_auth();
        let mut credential: Credential = env.storage().persistent()
            .get(&credential_id).expect("Not found");
        assert_eq!(credential.institution, institution, "Only issuing institution can revoke");
        assert!(matches!(credential.status, CredentialStatus::Valid), "Not revocable");

        credential.status = CredentialStatus::Revoked;
        credential.revoked_ledger = env.ledger().sequence();
        credential.revocation_reason = reason;
        env.storage().persistent().set(&credential_id, &credential);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("REVOKED")),
            (credential_id, institution),
        );
    }

    pub fn get_graduate_credentials(env: Env, graduate: Address) -> soroban_sdk::Vec<u64> {
        env.storage().persistent().get(&graduate)
            .unwrap_or(soroban_sdk::vec![&env])
    }

    pub fn transfer(_env: Env, _from: Address, _to: Address, _id: u64) {
        // Credentials are soul-bound and intentionally non-transferable
        panic!("Credentials cannot be transferred");
    }
}
```

### 3. Revocation Registry Contract

A lightweight contract optimised purely for revocation lookups — so verifiers can check status without loading full credential data.

```rust
// contracts/revocation-registry/src/lib.rs
#[contractimpl]
impl RevocationRegistry {
    pub fn is_revoked(env: Env, credential_id: u64) -> bool {
        env.storage().persistent()
            .get::<u64, bool>(&credential_id)
            .unwrap_or(false)
    }

    pub fn revoke(env: Env, credential_contract: Address, credential_id: u64) {
        credential_contract.require_auth();  // Only callable from credential-token contract
        env.storage().persistent().set(&credential_id, &true);
    }

    pub fn batch_check(env: Env, credential_ids: Vec<u64>) -> Map<u64, bool> {
        let mut results = Map::new(&env);
        for id in credential_ids.iter() {
            let revoked = env.storage().persistent()
                .get::<u64, bool>(&id).unwrap_or(false);
            results.set(id, revoked);
        }
        results
    }
}
```

### 4. Batch Issuer Contract

Gas-efficient bulk issuance for graduation ceremonies — up to 500 credentials in a single transaction.

```rust
// contracts/batch-issuer/src/lib.rs
#[contracttype]
#[derive(Clone)]
pub struct BatchCredentialInput {
    pub graduate: Address,
    pub credential_type: Symbol,
    pub field_of_study: String,
    pub title: String,
    pub grade: String,
    pub metadata_ipfs_hash: String,
}

#[contractimpl]
impl BatchIssuer {
    pub fn issue_batch(
        env: Env,
        institution: Address,
        credentials: Vec<BatchCredentialInput>,
        issue_date_unix: u64,
    ) -> Vec<u64> {
        institution.require_auth();
        assert!(credentials.len() <= 500, "Max 500 credentials per batch");

        let cred_contract: Address = env.storage().instance()
            .get(&symbol_short!("cred_ctrt")).unwrap();
        let client = CredentialTokenClient::new(&env, &cred_contract);

        let mut issued_ids: Vec<u64> = Vec::new(&env);
        for input in credentials.iter() {
            let id = client.issue(
                &institution, &input.graduate, &input.credential_type,
                &input.field_of_study, &input.title, &input.grade,
                &issue_date_unix, &0u64, &input.metadata_ipfs_hash,
            );
            issued_ids.push_back(id);
        }

        env.events().publish(
            (symbol_short!("BATCH"), symbol_short!("ISSUED")),
            (institution, issued_ids.len()),
        );
        issued_ids
    }
}
```

### Deploying Contracts

```bash
cd contracts
stellar contract build

# Generate and fund admin keypair
stellar keys generate --network testnet admin
stellar keys fund admin --network testnet

# Deploy
REGISTRY_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/institution_registry.wasm \
  --source admin --network testnet)

REVOCATION_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/revocation_registry.wasm \
  --source admin --network testnet)

CREDENTIAL_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/credential_token.wasm \
  --source admin --network testnet)

# Initialize credential token
stellar contract invoke \
  --id $CREDENTIAL_ID --source admin --network testnet \
  -- initialize \
  --admin $(stellar keys address admin) \
  --registry_contract $REGISTRY_ID \
  --revocation_contract $REVOCATION_ID

BATCH_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/batch_issuer.wasm \
  --source admin --network testnet)

echo "INSTITUTION_REGISTRY_CONTRACT_ID=$REGISTRY_ID"
echo "CREDENTIAL_TOKEN_CONTRACT_ID=$CREDENTIAL_ID"
echo "REVOCATION_REGISTRY_CONTRACT_ID=$REVOCATION_ID"
echo "BATCH_ISSUER_CONTRACT_ID=$BATCH_ID"
```

---

## Backend — NestJS

### Module Overview

```
src/modules/
├── auth/
│   ├── auth.service.ts             # SEP-10 challenge/verify + JWT
│   ├── auth.controller.ts          # POST /auth/challenge, /auth/verify
│   ├── jwt.strategy.ts
│   └── roles.guard.ts              # INSTITUTION | GRADUATE | ADMIN
│
├── institutions/
│   ├── institutions.service.ts
│   ├── institutions.controller.ts
│   └── entities/institution.entity.ts
│
├── credentials/
│   ├── credentials.service.ts      # Issue, revoke, query
│   ├── credentials.controller.ts
│   ├── bulk-issue.processor.ts     # BullMQ async batch minting
│   └── entities/credential.entity.ts
│
├── verification/
│   ├── verification.service.ts     # Public verify by ID or slug
│   └── verification.controller.ts  # GET /verification/:id (no auth)
│
├── graduates/
│   ├── graduates.service.ts
│   └── entities/graduate.entity.ts
│
└── notifications/
    └── notifications.service.ts    # SendGrid email + Africa's Talking SMS
```

### Authentication — SEP-10

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private stellarService: StellarService,
    private jwtService: JwtService,
    private institutionsService: InstitutionsService,
    private graduatesService: GraduatesService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getChallenge(publicKey: string): Promise<{ transaction: string }> {
    const xdr = await this.stellarService.buildChallengeTransaction(publicKey);
    await this.cache.set(`sep10:${publicKey}`, xdr, 300_000);
    return { transaction: xdr };
  }

  async verifyAndLogin(
    publicKey: string,
    signedXdr: string,
    role: 'INSTITUTION' | 'GRADUATE',
  ): Promise<{ accessToken: string; user: Institution | Graduate }> {
    const valid = await this.stellarService.verifyChallengeTransaction(signedXdr, publicKey);
    if (!valid) throw new UnauthorizedException('Invalid Stellar signature');

    const user = role === 'INSTITUTION'
      ? await this.institutionsService.findOrCreateByPublicKey(publicKey)
      : await this.graduatesService.findOrCreateByPublicKey(publicKey);

    return {
      accessToken: this.jwtService.sign({ sub: user.id, publicKey, role }),
      user,
    };
  }
}
```

### Credential Issuance Service

```typescript
// credentials/credentials.service.ts
@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential) private credRepo: Repository<Credential>,
    private sorobanService: SorobanService,
    private ipfsService: IpfsService,
    private notificationsService: NotificationsService,
    @InjectQueue('credentials') private credQueue: Queue,
  ) {}

  async issueCredential(institution: Institution, dto: IssueCredentialDto): Promise<Credential> {
    // 1. Upload metadata to IPFS
    const ipfsCid = await this.ipfsService.uploadJson({
      institution: {
        name: institution.name,
        country: institution.countryCode,
        accreditationBody: institution.accreditationBody,
        stellarAddress: institution.stellarPublicKey,
      },
      graduate: { name: dto.graduateName, studentId: dto.studentId },
      credential: {
        type: dto.credentialType,
        title: dto.title,
        fieldOfStudy: dto.fieldOfStudy,
        grade: dto.grade,
        issueDate: dto.issueDate,
      },
      issuedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    });

    // 2. Call Soroban credential-token contract
    const credentialId = await this.sorobanService.invokeContract<bigint>({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'issue',
      args: [
        nativeToScVal(institution.stellarPublicKey, { type: 'address' }),
        nativeToScVal(dto.graduatePublicKey, { type: 'address' }),
        xdr.ScVal.scvSymbol(dto.credentialType),
        nativeToScVal(dto.fieldOfStudy, { type: 'string' }),
        nativeToScVal(dto.title, { type: 'string' }),
        nativeToScVal(dto.grade, { type: 'string' }),
        nativeToScVal(BigInt(Math.floor(new Date(dto.issueDate).getTime() / 1000)), { type: 'u64' }),
        nativeToScVal(dto.expiryDate
          ? BigInt(Math.floor(new Date(dto.expiryDate).getTime() / 1000))
          : 0n, { type: 'u64' }),
        nativeToScVal(ipfsCid, { type: 'string' }),
      ],
      signerSecret: institution.signerSecret,
    });

    // 3. Persist off-chain index
    const credential = this.credRepo.create({
      stellarCredentialId: credentialId.toString(),
      institutionId: institution.id,
      graduatePublicKey: dto.graduatePublicKey,
      graduateName: dto.graduateName,
      credentialType: dto.credentialType,
      title: dto.title,
      fieldOfStudy: dto.fieldOfStudy,
      grade: dto.grade,
      issueDate: new Date(dto.issueDate),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      ipfsCid,
      status: CredentialStatus.VALID,
    });
    await this.credRepo.save(credential);

    // 4. Notify graduate
    await this.notificationsService.notifyCredentialIssued(credential, dto.graduateEmail);
    return credential;
  }

  async bulkIssue(institution: Institution, dto: BulkIssueDto) {
    const job = await this.credQueue.add('bulk-issue', {
      institutionId: institution.id,
      credentials: dto.credentials,
    });
    return { jobId: job.id, count: dto.credentials.length };
  }

  async revokeCredential(
    institution: Institution,
    credentialId: string,
    reason: string,
  ): Promise<Credential> {
    const credential = await this.credRepo.findOneOrFail({
      where: { stellarCredentialId: credentialId, institutionId: institution.id },
    });

    await this.sorobanService.invokeContract({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'revoke',
      args: [
        nativeToScVal(institution.stellarPublicKey, { type: 'address' }),
        nativeToScVal(BigInt(credentialId), { type: 'u64' }),
        nativeToScVal(reason, { type: 'string' }),
      ],
      signerSecret: institution.signerSecret,
    });

    credential.status = CredentialStatus.REVOKED;
    credential.revocationReason = reason;
    credential.revokedAt = new Date();
    return this.credRepo.save(credential);
  }
}
```

### Public Verification Service

```typescript
// verification/verification.service.ts
@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Credential) private credRepo: Repository<Credential>,
    private sorobanService: SorobanService,
    private ipfsService: IpfsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async verifyById(credentialId: string): Promise<VerificationResult> {
    const cached = await this.cache.get<VerificationResult>(`verify:${credentialId}`);
    if (cached) return cached;

    // Stellar ledger is the source of truth
    const onChain = await this.sorobanService.queryContract({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'verify',
      args: [nativeToScVal(BigInt(credentialId), { type: 'u64' })],
      callerPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    });

    const metadata = await this.ipfsService.fetchJson(onChain.metadataIpfsHash);
    const institution = await this.sorobanService.queryContract({
      contractId: process.env.INSTITUTION_REGISTRY_CONTRACT_ID,
      method: 'get_institution_by_address',
      args: [nativeToScVal(onChain.institution, { type: 'address' })],
      callerPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    });

    const result: VerificationResult = {
      credentialId,
      isValid: onChain.status === 'Valid',
      status: onChain.status,
      credential: {
        type: onChain.credentialType,
        title: onChain.title,
        fieldOfStudy: onChain.fieldOfStudy,
        grade: onChain.grade,
        issueDate: new Date(Number(onChain.issueDateUnix) * 1000),
        expiryDate: onChain.expiryDateUnix > 0n
          ? new Date(Number(onChain.expiryDateUnix) * 1000) : null,
      },
      institution: {
        name: institution.name,
        country: institution.countryCode,
        accreditationBody: institution.accreditationBody,
        stellarAddress: onChain.institution,
      },
      graduate: { stellarAddress: onChain.graduate, name: metadata.graduate.name },
      verificationCount: Number(onChain.verificationCount),
      revokedAt: onChain.revokedLedger > 0
        ? { ledger: onChain.revokedLedger, reason: onChain.revocationReason } : null,
      verifiedAt: new Date(),
    };

    if (result.isValid) {
      await this.cache.set(`verify:${credentialId}`, result, 300_000); // 5 min TTL
    }

    return result;
  }
}
```

### Bulk Issuance Queue Processor

```typescript
// credentials/bulk-issue.processor.ts
@Processor('credentials')
export class BulkIssueProcessor {
  @Process('bulk-issue')
  async handleBulkIssue(job: Job<BulkIssuePayload>) {
    const { institutionId, credentials } = job.data;
    const institution = await this.institutionsService.findById(institutionId);
    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < credentials.length; i++) {
      try {
        await this.credentialsService.issueCredential(institution, credentials[i]);
        results.success++;
        await job.progress(Math.floor((i / credentials.length) * 100));
      } catch (err) {
        results.failed++;
        results.errors.push({ index: i, studentId: credentials[i].studentId, error: err.message });
      }
    }

    await this.notificationsService.sendBulkIssueReport(institution, results);
    return results;
  }
}
```

---

## Frontend — Angular

### Role-Based Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/verify', pathMatch: 'full' },
  { path: 'verify/:id', loadComponent: () => import('./features/verify/verify.component') },
  {
    path: 'institution',
    canActivate: [AuthGuard, RoleGuard('INSTITUTION')],
    loadChildren: () => import('./features/institution/institution.routes'),
  },
  {
    path: 'graduate',
    canActivate: [AuthGuard, RoleGuard('GRADUATE')],
    loadChildren: () => import('./features/graduate/graduate.routes'),
  },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
];
```

### Wallet Service (Freighter)

```typescript
// core/services/wallet.service.ts
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private publicKey$ = new BehaviorSubject<string | null>(null);
  readonly connected$ = this.publicKey$.pipe(map(Boolean));

  async connect(): Promise<string> {
    if (!await isConnected()) throw new Error('Please install the Freighter wallet extension.');
    const key = await getPublicKey();
    this.publicKey$.next(key);
    return key;
  }

  async signTransaction(xdr: string, network: 'TESTNET' | 'PUBLIC'): Promise<string> {
    return signTransaction(xdr, { networkPassphrase: network });
  }

  getPublicKey(): string | null { return this.publicKey$.getValue(); }
}
```

### Public Verifier Component

```typescript
// features/verify/verify.component.ts
@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="verify-container">
      @if (loading()) {
        <mat-spinner></mat-spinner>
        <p>Querying Stellar blockchain...</p>
      }
      @if (result()) {
        <div class="result-card" [class.valid]="result().isValid" [class.revoked]="!result().isValid">
          <div class="status-banner">
            <mat-icon>{{ result().isValid ? 'verified' : 'cancel' }}</mat-icon>
            <span>{{ result().isValid ? 'Verified on Stellar' : result().status }}</span>
          </div>
          <h1>{{ result().credential.title }}</h1>
          <h2>{{ result().graduate.name }}</h2>
          <div class="meta-grid">
            <div><label>Institution</label><span>{{ result().institution.name }}</span></div>
            <div><label>Country</label><span>{{ result().institution.country }}</span></div>
            <div><label>Accreditation</label><span>{{ result().institution.accreditationBody }}</span></div>
            <div><label>Field of Study</label><span>{{ result().credential.fieldOfStudy }}</span></div>
            <div><label>Grade</label><span>{{ result().credential.grade }}</span></div>
            <div><label>Issue Date</label><span>{{ result().credential.issueDate | date:'longDate' }}</span></div>
          </div>
          <p class="chain-info">
            Credential #{{ credentialId() }} · Stellar: {{ result().institution.stellarAddress | truncateAddress }}
            · Verified {{ result().verificationCount }} times
          </p>
        </div>
      }
      @if (error()) {
        <div class="error-card">
          <mat-icon>error_outline</mat-icon>
          <h2>Credential not found</h2>
          <p>This ID does not exist on the Stellar blockchain.</p>
        </div>
      }
    </div>
  `,
})
export class VerifyComponent implements OnInit {
  credentialId = signal('');
  loading = signal(true);
  result = signal<VerificationResult | null>(null);
  error = signal<string | null>(null);

  constructor(private route: ActivatedRoute, private verificationService: VerificationService) {}

  ngOnInit() {
    this.credentialId.set(this.route.snapshot.paramMap.get('id'));
    this.verificationService.verify(this.credentialId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: r => this.result.set(r),
        error: e => this.error.set(e.message),
      });
  }
}
```

### NgRx Credentials Store

```typescript
// store/credentials/credentials.actions.ts
export const CredentialActions = createActionGroup({
  source: 'Credentials',
  events: {
    'Load My Credentials': emptyProps(),
    'Load My Credentials Success': props<{ credentials: Credential[] }>(),
    'Issue Success': props<{ credential: Credential }>(),
    'Revoke Success': props<{ credentialId: string }>(),
    'Verify Success': props<{ result: VerificationResult }>(),
  },
});

// store/credentials/credentials.reducer.ts
export const credentialsReducer = createReducer(
  initialState,
  on(CredentialActions.loadMyCredentialsSuccess, (state, { credentials }) =>
    ({ ...state, items: credentials, loading: false })),
  on(CredentialActions.issueSuccess, (state, { credential }) =>
    ({ ...state, items: [...state.items, credential] })),
  on(CredentialActions.revokeSuccess, (state, { credentialId }) => ({
    ...state,
    items: state.items.map(c =>
      c.stellarCredentialId === credentialId
        ? { ...c, status: CredentialStatus.REVOKED } : c),
  })),
);
```

---

## Verification Flow

```
Employer visits:
https://certchain.africa/verify/4821

          │
          ▼
┌─────────────────────────┐
│  Angular (no login)     │
│  verify.component       │
└──────────┬──────────────┘
           │ GET /verification/4821
           ▼
┌─────────────────────────┐
│  NestJS                 │
│  VerificationService    │
└──────────┬──────────────┘
           │ Soroban RPC query
           ▼
┌─────────────────────────┐
│  Stellar Mainnet        │
│                         │
│  credential_token       │
│  .verify(4821)          │
└──────────┬──────────────┘
           │ Returns Credential struct
           ▼
┌─────────────────────────┐
│  IPFS                   │
│  Fetch by CID           │
└──────────┬──────────────┘
           │ Returns full metadata JSON
           ▼
┌──────────────────────────────────────────────┐
│  ✅ VALID                                    │
│  Bachelor of Science — Computer Science      │
│  Amara Diallo                                │
│  University of Lagos · NUC Accredited        │
│  Issued: June 15, 2023                       │
│  Verified 12 times                           │
└──────────────────────────────────────────────┘

Total time: ~1.5 seconds
Institution contact required: 0
```

---

## Data Models

```typescript
@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) stellarPublicKey: string;
  @Column() name: string;
  @Column({ length: 2 }) countryCode: string;
  @Column() accreditationBody: string;
  @Column() accreditationId: string;
  @Column() institutionType: string;
  @Column({ nullable: true }) website: string;
  @Column({ nullable: true }) logoIpfsCid: string;
  @Column({ default: 'PENDING' }) status: string;
  @Column({ nullable: true, select: false }) signerSecret: string; // AES-256 encrypted
  @OneToMany(() => Credential, c => c.institution) credentials: Credential[];
  @CreateDateColumn() createdAt: Date;
}

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) stellarCredentialId: string;
  @Column() graduatePublicKey: string;
  @Column() graduateName: string;
  @Column() credentialType: string;
  @Column() title: string;
  @Column() fieldOfStudy: string;
  @Column() grade: string;
  @Column() issueDate: Date;
  @Column({ nullable: true }) expiryDate: Date;
  @Column() ipfsCid: string;
  @Column({ default: 'VALID' }) status: string;
  @Column({ nullable: true }) revocationReason: string;
  @Column({ nullable: true }) revokedAt: Date;
  @ManyToOne(() => Institution, i => i.credentials) institution: Institution;
  @Column() institutionId: string;
  @Index() @Column({ generated: 'uuid', unique: true }) shareSlug: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('graduates')
export class Graduate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) stellarPublicKey: string;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) countryCode: string;
  @CreateDateColumn() createdAt: Date;
}
```

---

## API Reference

Full Swagger docs at `/api/docs` when running the backend.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/challenge` | Get SEP-10 challenge XDR | Public |
| `POST` | `/auth/verify` | Verify signed XDR, return JWT | Public |
| `POST` | `/institutions/register` | Register institution | Admin JWT |
| `GET` | `/institutions/:id` | Get institution profile | Public |
| `PUT` | `/institutions/me` | Update profile | Institution JWT |
| `GET` | `/institutions/me/stats` | Issuance analytics | Institution JWT |
| `POST` | `/credentials` | Issue single credential | Institution JWT |
| `POST` | `/credentials/bulk` | Bulk issue from CSV | Institution JWT |
| `GET` | `/credentials/bulk/:jobId` | Bulk job status | Institution JWT |
| `GET` | `/credentials` | List institution credentials | Institution JWT |
| `DELETE` | `/credentials/:id` | Revoke credential | Institution JWT |
| `GET` | `/verification/:id` | **Verify by ID** | **Public** |
| `GET` | `/verification/slug/:slug` | Verify by share slug | **Public** |
| `POST` | `/verification/bulk` | Bulk verify ID list | Public |
| `GET` | `/graduates/me/credentials` | Graduate wallet | Graduate JWT |
| `GET` | `/graduates/me/credentials/:id/share` | Get share URL + QR | Graduate JWT |
| `GET` | `/graduates/me/credentials/:id/pdf` | Download PDF certificate | Graduate JWT |

---

## Environment Variables

### Backend (`.env`)

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DATABASE_URL=postgresql://certchain:password@localhost:5432/certchain_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_SERVER_PUBLIC_KEY=
STELLAR_SERVER_SECRET_KEY=

# Platform relayer
PLATFORM_PUBLIC_KEY=
PLATFORM_SECRET_KEY=

# Contract IDs (populated after deployment)
INSTITUTION_REGISTRY_CONTRACT_ID=
CREDENTIAL_TOKEN_CONTRACT_ID=
REVOCATION_REGISTRY_CONTRACT_ID=
BATCH_ISSUER_CONTRACT_ID=

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs

# Notifications
SENDGRID_API_KEY=
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=

# Encryption (for institution signer secrets at rest)
ENCRYPTION_KEY=32-byte-hex-key-here
```

### Frontend (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appUrl: 'http://localhost:4200',
  stellarNetwork: 'TESTNET' as const,
  contractIds: {
    institutionRegistry: '',
    credentialToken: '',
    revocationRegistry: '',
    batchIssuer: '',
  },
};
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- Rust + `stellar-cli` (`cargo install stellar-cli --locked`)
- Freighter wallet browser extension

### 1. Clone the repository

```bash
git clone https://github.com/your-org/certchain-africa.git
cd certchain-africa
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis ipfs
```

### 3. Deploy Soroban contracts to Testnet

```bash
cd contracts
stellar contract build

stellar keys generate --network testnet admin
stellar keys fund admin --network testnet

REGISTRY_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/institution_registry.wasm \
  --source admin --network testnet)

REVOCATION_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/revocation_registry.wasm \
  --source admin --network testnet)

CREDENTIAL_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/credential_token.wasm \
  --source admin --network testnet)

stellar contract invoke \
  --id $CREDENTIAL_ID --source admin --network testnet \
  -- initialize \
  --admin $(stellar keys address admin) \
  --registry_contract $REGISTRY_ID \
  --revocation_contract $REVOCATION_ID

BATCH_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/batch_issuer.wasm \
  --source admin --network testnet)

echo "Copy these into your .env:"
echo "INSTITUTION_REGISTRY_CONTRACT_ID=$REGISTRY_ID"
echo "CREDENTIAL_TOKEN_CONTRACT_ID=$CREDENTIAL_ID"
echo "REVOCATION_REGISTRY_CONTRACT_ID=$REVOCATION_ID"
echo "BATCH_ISSUER_CONTRACT_ID=$BATCH_ID"
```

### 4. Start the backend

```bash
cd apps/backend
cp .env.example .env
# Fill in contract IDs and Stellar keypairs

npm install
npm run migration:run
npm run start:dev
# API:     http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

### 5. Start the frontend

```bash
cd apps/frontend
npm install
npm run start
# App: http://localhost:4200
```

---

## Testing

### Backend

```bash
cd apps/backend
npm run test          # Unit tests
npm run test:e2e      # Integration tests (requires running DB + Redis)
npm run test:cov      # Coverage report
```

### Smart Contracts

```bash
cd contracts/credential-token   && cargo test
cd contracts/institution-registry && cargo test
cd contracts/revocation-registry  && cargo test
```

### Frontend

```bash
cd apps/frontend
npm run test   # Karma unit tests
npm run e2e    # Playwright end-to-end
```

---

## Deployment

### Docker Compose (staging)

```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

### GitHub Actions CI/CD

The pipeline (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Lint + test backend
2. Lint + test frontend
3. Build + test Soroban contracts
4. Build Docker images → push to ECR
5. Deploy to AWS ECS

---

## Security Considerations

- **Institution signer secrets** are encrypted at rest using AES-256-GCM; the key lives only in environment variables / AWS Secrets Manager — never in the database in plaintext
- **SEP-10 challenges** expire in 5 minutes and are single-use; replaying a signed challenge does not grant access
- **Credentials are soul-bound** — the `transfer` function on the Soroban contract explicitly panics; no credential can move to another wallet
- **IPFS metadata** contains no private information beyond what the institution explicitly includes — no national ID numbers, biometrics, or sensitive personal data
- **Revocation is real-time** — the Soroban contract is the source of truth; cached verification results have a maximum TTL of 5 minutes
- **Rate limiting** on the public `/verification` endpoint prevents bulk enumeration attacks
- **Institution registration** is gated by admin approval with accreditation body verification; no self-registration

---

## Roadmap

### Phase 1 — Core Platform (months 1–3)
- [ ] Soroban contracts: institution registry, credential token, revocation registry
- [ ] NestJS: auth, institutions, credentials, verification modules
- [ ] Angular: institution portal, graduate wallet, public verifier
- [ ] Testnet deployment with 3 pilot institutions

### Phase 2 — Scale & Access (months 4–6)
- [ ] Batch issuer contract + CSV bulk upload UI
- [ ] USSD interface for feature phone credential retrieval
- [ ] PDF certificate generator with institution branding
- [ ] Webhook API for ATS/HR system integration
- [ ] Nigeria, Kenya, Ghana, South Africa launch

### Phase 3 — Ecosystem (months 7–12)
- [ ] Professional license renewal on-chain
- [ ] Cross-institution transcript aggregation
- [ ] Verified credential job board
- [ ] Mobile app (Angular + Capacitor)
- [ ] DAO governance for institution accreditation decisions

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
git checkout -b feature/your-feature
# make changes, write tests
git commit -m "feat: add USSD verification gateway"
git push origin feature/your-feature
# open a PR
```

---

## License

[MIT](LICENSE) © 2025 CertChain Africa

---

> *"Education is the most powerful weapon you can use to change the world."*
> — Nelson Mandela
>
> CertChain Africa ensures that weapon cannot be forged.
