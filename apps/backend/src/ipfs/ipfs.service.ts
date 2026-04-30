import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'kubo-rpc-client';

@Injectable()
export class IpfsService {
  private client: ReturnType<typeof create>;
  private readonly logger = new Logger(IpfsService.name);

  constructor(private config: ConfigService) {
    this.client = create({ url: config.get('IPFS_API_URL', 'http://localhost:5001') });
  }

  async uploadJson(data: object): Promise<string> {
    const content = JSON.stringify(data);
    const result = await this.client.add(content, { pin: true });
    this.logger.log(`Uploaded to IPFS: ${result.cid.toString()}`);
    return result.cid.toString();
  }

  async fetchJson<T = unknown>(cid: string): Promise<T> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk);
    }
    const content = Buffer.concat(chunks).toString('utf-8');
    return JSON.parse(content) as T;
  }

  getGatewayUrl(cid: string): string {
    const gateway = this.config.get('IPFS_GATEWAY_URL', 'https://ipfs.io/ipfs');
    return `${gateway}/${cid}`;
  }
}
