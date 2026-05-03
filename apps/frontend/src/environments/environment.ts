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
