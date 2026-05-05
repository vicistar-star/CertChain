import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface Credential {
  id: string;
  stellarCredentialId: string;
  graduateName: string;
  credentialType: string;
  title: string;
  fieldOfStudy: string;
  grade: string;
  issueDate: string;
  status: string;
  ipfsCid: string;
  shareSlug: string;
}

export interface VerificationResult {
  credentialId: string;
  isValid: boolean;
  status: string;
}

export const CredentialActions = createActionGroup({
  source: 'Credentials',
  events: {
    'Load My Credentials': emptyProps(),
    'Load My Credentials Success': props<{ credentials: Credential[] }>(),
    'Load My Credentials Failure': props<{ error: string }>(),
    'Issue Credential': props<{ dto: any }>(),
    'Issue Success': props<{ credential: Credential }>(),
    'Issue Failure': props<{ error: string }>(),
    'Revoke Credential': props<{ credentialId: string; reason: string }>(),
    'Revoke Success': props<{ credentialId: string }>(),
    'Verify Success': props<{ result: VerificationResult }>(),
  },
});
