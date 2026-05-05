import { createReducer, on } from '@ngrx/store';
import { CredentialActions, Credential, VerificationResult } from './credentials.actions';

export interface CredentialsState {
  items: Credential[];
  loading: boolean;
  error: string | null;
  lastVerification: VerificationResult | null;
}

const initialState: CredentialsState = {
  items: [],
  loading: false,
  error: null,
  lastVerification: null,
};

export const credentialsReducer = createReducer(
  initialState,
  on(CredentialActions.loadMyCredentials, (state) => ({ ...state, loading: true, error: null })),
  on(CredentialActions.loadMyCredentialsSuccess, (state, { credentials }) => ({
    ...state,
    items: credentials,
    loading: false,
  })),
  on(CredentialActions.loadMyCredentialsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(CredentialActions.issueSuccess, (state, { credential }) => ({
    ...state,
    items: [...state.items, credential],
  })),
  on(CredentialActions.revokeSuccess, (state, { credentialId }) => ({
    ...state,
    items: state.items.map((c) =>
      c.stellarCredentialId === credentialId ? { ...c, status: 'REVOKED' } : c,
    ),
  })),
  on(CredentialActions.verifySuccess, (state, { result }) => ({
    ...state,
    lastVerification: result,
  })),
);
