import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { Credential, CredentialStatus, CredentialType } from './entities/credential.entity';
import { Institution } from '../institutions/entities/institution.entity';
import { SorobanService } from '../../stellar/soroban.service';
import { IpfsService } from '../../ipfs/ipfs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IsString, IsEnum, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class IssueCredentialDto {
  @IsString() graduatePublicKey: string;
  @IsString() graduateName: string;
  @IsEmail() @IsOptional() graduateEmail?: string;
  @IsString() @IsOptional() studentId?: string;
  @IsEnum(CredentialType) credentialType: CredentialType;
  @IsString() title: string;
  @IsString() fieldOfStudy: string;
  @IsString() grade: string;
  @IsDateString() issueDate: string;
  @IsDateString() @IsOptional() expiryDate?: string;
}

export class BulkIssueDto {
  credentials: IssueCredentialDto[];
}

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential) private credRepo: Repository<Credential>,
    private sorobanService: SorobanService,
    private ipfsService: IpfsService,
    private notificationsService: NotificationsService,
    @InjectQueue('credentials') private credQueue: Queue,
  ) {}

  async issueCredential(
    institution: Institution,
    dto: IssueCredentialDto,
  ): Promise<Credential> {
    // 1. Upload metadata to IPFS
    const ipfsCid = await this.ipfsService.uploadJson({
      institution: {
        name: institution.name,
        country: institution.countryCode,
        accreditationBody: institution.accreditationBody,
        stellarAddress: institution.stellarPublicKey,
      },
      graduate: { name: dto.graduateName, studentId: dto.studentId },
      credential: {
        type: dto.credentialType,
        title: dto.title,
        fieldOfStudy: dto.fieldOfStudy,
        grade: dto.grade,
        issueDate: dto.issueDate,
      },
      issuedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    });

    // 2. Call Soroban credential-token contract
    const credentialId = await this.sorobanService.invokeContract<bigint>({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'issue',
      args: [
        nativeToScVal(institution.stellarPublicKey, { type: 'address' }),
        nativeToScVal(dto.graduatePublicKey, { type: 'address' }),
        xdr.ScVal.scvSymbol(dto.credentialType),
        nativeToScVal(dto.fieldOfStudy, { type: 'string' }),
        nativeToScVal(dto.title, { type: 'string' }),
        nativeToScVal(dto.grade, { type: 'string' }),
        nativeToScVal(
          BigInt(Math.floor(new Date(dto.issueDate).getTime() / 1000)),
          { type: 'u64' },
        ),
        nativeToScVal(
          dto.expiryDate
            ? BigInt(Math.floor(new Date(dto.expiryDate).getTime() / 1000))
            : 0n,
          { type: 'u64' },
        ),
        nativeToScVal(ipfsCid, { type: 'string' }),
      ],
      signerSecret: institution.signerSecret,
    });

    // 3. Persist off-chain index
    const credential = this.credRepo.create({
      stellarCredentialId: credentialId.toString(),
      institutionId: institution.id,
      graduatePublicKey: dto.graduatePublicKey,
      graduateName: dto.graduateName,
      graduateEmail: dto.graduateEmail,
      studentId: dto.studentId,
      credentialType: dto.credentialType,
      title: dto.title,
      fieldOfStudy: dto.fieldOfStudy,
      grade: dto.grade,
      issueDate: new Date(dto.issueDate),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      ipfsCid,
      status: CredentialStatus.VALID,
    });
    await this.credRepo.save(credential);

    // 4. Notify graduate
    if (dto.graduateEmail) {
      await this.notificationsService.notifyCredentialIssued(credential, dto.graduateEmail);
    }
    return credential;
  }

  async bulkIssue(institution: Institution, dto: BulkIssueDto) {
    const job = await this.credQueue.add('bulk-issue', {
      institutionId: institution.id,
      credentials: dto.credentials,
    });
    return { jobId: job.id, count: dto.credentials.length };
  }

  async getBulkJobStatus(jobId: string) {
    const job = await this.credQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');
    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      result: job.returnvalue,
    };
  }

  async revokeCredential(
    institution: Institution,
    credentialId: string,
    reason: string,
  ): Promise<Credential> {
    const credential = await this.credRepo.findOneOrFail({
      where: { stellarCredentialId: credentialId, institutionId: institution.id },
    });

    await this.sorobanService.invokeContract({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'revoke',
      args: [
        nativeToScVal(institution.stellarPublicKey, { type: 'address' }),
        nativeToScVal(BigInt(credentialId), { type: 'u64' }),
        nativeToScVal(reason, { type: 'string' }),
      ],
      signerSecret: institution.signerSecret,
    });

    credential.status = CredentialStatus.REVOKED;
    credential.revocationReason = reason;
    credential.revokedAt = new Date();
    return this.credRepo.save(credential);
  }

  async listByInstitution(institutionId: string): Promise<Credential[]> {
    return this.credRepo.find({
      where: { institutionId },
      order: { createdAt: 'DESC' },
    });
  }

  async listByGraduate(publicKey: string): Promise<Credential[]> {
    return this.credRepo.find({
      where: { graduatePublicKey: publicKey },
      relations: ['institution'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Credential> {
    const cred = await this.credRepo.findOne({
      where: { shareSlug: slug },
      relations: ['institution'],
    });
    if (!cred) throw new NotFoundException('Credential not found');
    return cred;
  }
}
