#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum CredentialStatus {
    Valid,
    Revoked,
    Expired,
}

#[contracttype]
#[derive(Clone)]
pub struct Credential {
    pub id: u64,
    pub institution: Address,
    pub graduate: Address,
    pub credential_type: Symbol,
    pub field_of_study: String,
    pub title: String,
    pub grade: String,
    pub issue_date_unix: u64,
    pub expiry_date_unix: u64,
    pub metadata_ipfs_hash: String,
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
    pub fn initialize(env: Env, admin: Address, registry_contract: Address) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage()
            .instance()
            .set(&symbol_short!("registry"), &registry_contract);
        env.storage()
            .instance()
            .set(&symbol_short!("cred_ct"), &0u64);
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

        let id: u64 = env
            .storage()
            .instance()
            .get(&symbol_short!("cred_ct"))
            .unwrap_or(0u64)
            + 1;

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
        env.storage()
            .instance()
            .set(&symbol_short!("cred_ct"), &id);

        // Append to graduate's credential list
        let mut grad_creds: Vec<u64> = env
            .storage()
            .persistent()
            .get(&graduate)
            .unwrap_or(Vec::new(&env));
        grad_creds.push_back(id);
        env.storage().persistent().set(&graduate, &grad_creds);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("ISSUED")),
            (id, institution, graduate),
        );
        id
    }

    pub fn verify(env: Env, credential_id: u64) -> Credential {
        let mut credential: Credential = env
            .storage()
            .persistent()
            .get(&credential_id)
            .expect("Credential not found");

        if credential.expiry_date_unix > 0
            && env.ledger().timestamp() > credential.expiry_date_unix
            && matches!(credential.status, CredentialStatus::Valid)
        {
            credential.status = CredentialStatus::Expired;
        }

        credential.verification_count += 1;
        env.storage()
            .persistent()
            .set(&credential_id, &credential);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("VERIFIED")),
            credential_id,
        );
        credential
    }

    pub fn revoke(env: Env, institution: Address, credential_id: u64, reason: String) {
        institution.require_auth();
        let mut credential: Credential = env
            .storage()
            .persistent()
            .get(&credential_id)
            .expect("Credential not found");
        assert_eq!(
            credential.institution,
            institution,
            "Only issuing institution can revoke"
        );
        assert!(
            matches!(credential.status, CredentialStatus::Valid),
            "Credential is not revocable"
        );

        credential.status = CredentialStatus::Revoked;
        credential.revoked_ledger = env.ledger().sequence();
        credential.revocation_reason = reason;
        env.storage()
            .persistent()
            .set(&credential_id, &credential);

        env.events().publish(
            (symbol_short!("CRED"), symbol_short!("REVOKED")),
            (credential_id, institution),
        );
    }

    pub fn get_graduate_credentials(env: Env, graduate: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&graduate)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_credential(env: Env, credential_id: u64) -> Credential {
        env.storage()
            .persistent()
            .get(&credential_id)
            .expect("Credential not found")
    }

    pub fn credential_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&symbol_short!("cred_ct"))
            .unwrap_or(0)
    }

    // Soul-bound: transfers are intentionally disabled
    pub fn transfer(_env: Env, _from: Address, _to: Address, _id: u64) {
        panic!("Credentials are soul-bound and cannot be transferred");
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, CredentialTokenClient<'static>, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, CredentialToken);
        let client = CredentialTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let registry = Address::generate(&env);
        let institution = Address::generate(&env);
        let graduate = Address::generate(&env);

        client.initialize(&admin, &registry);
        (env, client, institution, graduate, admin)
    }

    #[test]
    fn test_issue_and_verify() {
        let (env, client, institution, graduate, _admin) = setup();

        let id = client.issue(
            &institution,
            &graduate,
            &symbol_short!("BSC"),
            &String::from_str(&env, "Computer Science"),
            &String::from_str(&env, "Bachelor of Science"),
            &String::from_str(&env, "First Class"),
            &1_700_000_000u64,
            &0u64,
            &String::from_str(&env, "QmTestHash"),
        );

        assert_eq!(id, 1);
        let cred = client.verify(&id);
        assert_eq!(cred.verification_count, 1);
        assert!(matches!(cred.status, CredentialStatus::Valid));
    }

    #[test]
    fn test_revoke() {
        let (env, client, institution, graduate, _admin) = setup();

        let id = client.issue(
            &institution,
            &graduate,
            &symbol_short!("BSC"),
            &String::from_str(&env, "Law"),
            &String::from_str(&env, "Bachelor of Laws"),
            &String::from_str(&env, "Second Class Upper"),
            &1_700_000_000u64,
            &0u64,
            &String::from_str(&env, "QmLawHash"),
        );

        client.revoke(
            &institution,
            &id,
            &String::from_str(&env, "Academic misconduct"),
        );

        let cred = client.get_credential(&id);
        assert!(matches!(cred.status, CredentialStatus::Revoked));
    }

    #[test]
    fn test_graduate_credential_list() {
        let (env, client, institution, graduate, _admin) = setup();

        client.issue(
            &institution,
            &graduate,
            &symbol_short!("BSC"),
            &String::from_str(&env, "Engineering"),
            &String::from_str(&env, "B.Eng"),
            &String::from_str(&env, "Second Class"),
            &1_700_000_000u64,
            &0u64,
            &String::from_str(&env, "QmEngHash"),
        );
        client.issue(
            &institution,
            &graduate,
            &symbol_short!("MSC"),
            &String::from_str(&env, "Engineering"),
            &String::from_str(&env, "M.Eng"),
            &String::from_str(&env, "Distinction"),
            &1_710_000_000u64,
            &0u64,
            &String::from_str(&env, "QmMEngHash"),
        );

        let creds = client.get_graduate_credentials(&graduate);
        assert_eq!(creds.len(), 2);
    }
}
