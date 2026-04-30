import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  scValToNative,
  nativeToScVal,
  Networks,
  Keypair,
  xdr,
} from '@stellar/stellar-sdk';

export interface InvokeContractParams {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signerSecret: string;
}

export interface QueryContractParams {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  callerPublicKey: string;
}

@Injectable()
export class SorobanService {
  private rpc: SorobanRpc.Server;
  private networkPassphrase: string;

  constructor(private config: ConfigService) {
    this.rpc = new SorobanRpc.Server(config.get('STELLAR_RPC_URL'), {
      allowHttp: config.get('STELLAR_NETWORK') === 'testnet',
    });
    this.networkPassphrase =
      config.get('STELLAR_NETWORK') === 'testnet'
        ? Networks.TESTNET
        : Networks.PUBLIC;
  }

  async invokeContract<T = unknown>({
    contractId,
    method,
    args,
    signerSecret,
  }: InvokeContractParams): Promise<T> {
    const contract = new Contract(contractId);
    const keypair = Keypair.fromSecret(signerSecret);
    const account = await this.rpc.getAccount(keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: this.networkPassphrase,
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
    if (sent.status === 'ERROR') {
      throw new Error(`Submit failed: ${sent.errorResult}`);
    }

    let result = await this.rpc.getTransaction(sent.hash);
    while (
      result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      result = await this.rpc.getTransaction(sent.hash);
    }

    if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain');
    }

    return scValToNative(
      (result as SorobanRpc.Api.GetSuccessfulTransactionResponse).returnValue,
    ) as T;
  }

  async queryContract<T = unknown>({
    contractId,
    method,
    args,
    callerPublicKey,
  }: QueryContractParams): Promise<T> {
    const contract = new Contract(contractId);
    const account = await this.rpc.getAccount(callerPublicKey);

    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(sim)) {
      throw new Error(`Query failed: ${sim.error}`);
    }

    const successSim = sim as SorobanRpc.Api.SimulateTransactionSuccessResponse;
    return scValToNative(successSim.result.retval) as T;
  }

  nativeToScVal = nativeToScVal;
}
