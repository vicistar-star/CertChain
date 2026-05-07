# CertChain Africa — Architecture Notes

## Contract Deployment Order

1. `institution-registry` — no dependencies
2. `revocation-registry` — no dependencies  
3. `credential-token` — depends on institution-registry address
4. `batch-issuer` — depends on credential-token address

## Key Design Decisions

- **Soul-bound credentials**: `transfer()` panics by design — credentials cannot move wallets
- **Dual storage**: Soroban is source of truth; PostgreSQL is a queryable index only
- **IPFS metadata**: Keeps on-chain storage minimal (only hash stored on ledger)
- **SEP-10 auth**: No passwords — Stellar keypair signature proves identity
- **5-minute verification cache**: Balances freshness with RPC cost for public endpoint
