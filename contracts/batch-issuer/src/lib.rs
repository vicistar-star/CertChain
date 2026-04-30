#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct BatchCredentialInput {
    pub graduate: Address,
    pub credential_type: Symbol,
    pub field_of_study: String,
    pub title: String,
    pub grade: String,
    pub metadata_ipfs_hash: String,
    pub expiry_date_unix: u64,
}

mod credential_token {
    soroban_sdk::contractimport!(
        file = "../target/wasm32-unknown-unknown/release/credential_token.wasm"
    );
}

#[contract]
pub struct BatchIssuer;

#[contractimpl]
impl BatchIssuer {
    pub fn initialize(env: Env, credential_contract: Address) {
        if env.storage().instance().has(&symbol_short!("cred_ctrt")) {
            panic!("Already initialized");
        }
        env.storage()
            .instance()
            .set(&symbol_short!("cred_ctrt"), &credential_contract);
    }

    pub fn issue_batch(
        env: Env,
        institution: Address,
        credentials: Vec<BatchCredentialInput>,
        issue_date_unix: u64,
    ) -> Vec<u64> {
        institution.require_auth();
        assert!(credentials.len() <= 500, "Max 500 credentials per batch");

        let cred_contract: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("cred_ctrt"))
            .unwrap();
        let client = credential_token::Client::new(&env, &cred_contract);

        let mut issued_ids: Vec<u64> = Vec::new(&env);
        for input in credentials.iter() {
            let id = client.issue(
                &institution,
                &input.graduate,
                &input.credential_type,
                &input.field_of_study,
                &input.title,
                &input.grade,
                &issue_date_unix,
                &input.expiry_date_unix,
                &input.metadata_ipfs_hash,
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
