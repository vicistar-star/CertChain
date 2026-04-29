#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum InstitutionStatus {
    Active,
    Suspended,
    Deaccredited,
}

#[contracttype]
#[derive(Clone)]
pub struct Institution {
    pub id: u64,
    pub stellar_address: Address,
    pub name: String,
    pub country_code: String,
    pub accreditation_body: String,
    pub accreditation_id: String,
    pub institution_type: Symbol,
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
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap();
        stored_admin.require_auth();

        let id: u64 = env
            .storage()
            .instance()
            .get(&symbol_short!("inst_ct"))
            .unwrap_or(0u64)
            + 1;

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
            (symbol_short!("INST"), symbol_short!("REG")),
            (id, stellar_address),
        );
        id
    }

    pub fn is_active(env: Env, address: Address) -> bool {
        if let Some(id) = env
            .storage()
            .persistent()
            .get::<Address, u64>(&address)
        {
            let inst: Institution = env.storage().persistent().get(&id).unwrap();
            matches!(inst.status, InstitutionStatus::Active)
        } else {
            false
        }
    }

    pub fn get_institution(env: Env, address: Address) -> Institution {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&address)
            .expect("Institution not found");
        env.storage().persistent().get(&id).unwrap()
    }

    pub fn get_institution_by_id(env: Env, id: u64) -> Institution {
        env.storage()
            .persistent()
            .get(&id)
            .expect("Institution not found")
    }

    pub fn suspend_institution(env: Env, admin: Address, institution_id: u64) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap();
        stored_admin.require_auth();
        let mut inst: Institution =
            env.storage().persistent().get(&institution_id).unwrap();
        inst.status = InstitutionStatus::Suspended;
        env.storage().persistent().set(&institution_id, &inst);
    }

    pub fn increment_issued(env: Env, institution_address: Address) {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&institution_address)
            .unwrap();
        let mut inst: Institution = env.storage().persistent().get(&id).unwrap();
        inst.credentials_issued += 1;
        env.storage().persistent().set(&id, &inst);
    }

    pub fn institution_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&symbol_short!("inst_ct"))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_register_and_query() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, InstitutionRegistry);
        let client = InstitutionRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let inst_addr = Address::generate(&env);

        client.initialize(&admin);
        let id = client.register_institution(
            &admin,
            &inst_addr,
            &String::from_str(&env, "University of Lagos"),
            &String::from_str(&env, "NG"),
            &String::from_str(&env, "NUC"),
            &String::from_str(&env, "NUC/2024/001"),
            &symbol_short!("UNIV"),
            &String::from_str(&env, "https://unilag.edu.ng"),
        );

        assert_eq!(id, 1);
        assert!(client.is_active(&inst_addr));
        assert_eq!(client.institution_count(), 1);
    }

    #[test]
    fn test_suspend_institution() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, InstitutionRegistry);
        let client = InstitutionRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let inst_addr = Address::generate(&env);

        client.initialize(&admin);
        client.register_institution(
            &admin,
            &inst_addr,
            &String::from_str(&env, "Test Poly"),
            &String::from_str(&env, "GH"),
            &String::from_str(&env, "NAB"),
            &String::from_str(&env, "NAB/001"),
            &symbol_short!("POLY"),
            &String::from_str(&env, "https://testpoly.edu.gh"),
        );

        client.suspend_institution(&admin, &1u64);
        assert!(!client.is_active(&inst_addr));
    }
}
