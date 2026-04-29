#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, Vec};

#[contracttype]
#[derive(Clone)]
pub struct RevocationEntry {
    pub credential_id: u64,
    pub revoked_at_ledger: u32,
}

#[contract]
pub struct RevocationRegistry;

#[contractimpl]
impl RevocationRegistry {
    pub fn initialize(env: Env, credential_contract: Address) {
        if env.storage().instance().has(&symbol_short!("cred_ct")) {
            panic!("Already initialized");
        }
        env.storage()
            .instance()
            .set(&symbol_short!("cred_ct"), &credential_contract);
    }

    pub fn revoke(env: Env, caller: Address, credential_id: u64) {
        let cred_contract: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("cred_ct"))
            .unwrap();
        // In production the credential contract calls this; for flexibility allow admin too
        if caller != cred_contract {
            caller.require_auth();
        }
        let entry = RevocationEntry {
            credential_id,
            revoked_at_ledger: env.ledger().sequence(),
        };
        env.storage().persistent().set(&credential_id, &entry);
        env.events().publish(
            (symbol_short!("REVOC"), symbol_short!("SET")),
            credential_id,
        );
    }

    pub fn is_revoked(env: Env, credential_id: u64) -> bool {
        env.storage()
            .persistent()
            .has(&credential_id)
    }

    pub fn batch_check(env: Env, credential_ids: Vec<u64>) -> Map<u64, bool> {
        let mut results: Map<u64, bool> = Map::new(&env);
        for id in credential_ids.iter() {
            results.set(id, env.storage().persistent().has(&id));
        }
        results
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Env};

    #[test]
    fn test_revoke_and_check() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RevocationRegistry);
        let client = RevocationRegistryClient::new(&env, &contract_id);

        let cred_contract = Address::generate(&env);
        client.initialize(&cred_contract);

        assert!(!client.is_revoked(&42u64));
        client.revoke(&cred_contract, &42u64);
        assert!(client.is_revoked(&42u64));
    }

    #[test]
    fn test_batch_check() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RevocationRegistry);
        let client = RevocationRegistryClient::new(&env, &contract_id);

        let cred_contract = Address::generate(&env);
        client.initialize(&cred_contract);
        client.revoke(&cred_contract, &1u64);

        let results = client.batch_check(&vec![&env, 1u64, 2u64, 3u64]);
        assert!(results.get(1u64).unwrap());
        assert!(!results.get(2u64).unwrap());
    }
}
