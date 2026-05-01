import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { Institution } from '../../institutions/entities/institution.entity';

export enum CredentialStatus {
  VALID = 'VALID',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum CredentialType {
  BACHELORS = 'BACHELORS',
  MASTERS = 'MASTERS',
  PHD = 'PHD',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATE = 'CERTIFICATE',
  LICENSE = 'LICENSE',
}

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  stellarCredentialId: string;

  @Index()
  @Column()
  graduatePublicKey: string;

  @Column()
  graduateName: string;

  @Column({ nullable: true })
  graduateEmail: string;

  @Column({ nullable: true })
  studentId: string;

  @Column({ type: 'enum', enum: CredentialType })
  credentialType: CredentialType;

  @Column()
  title: string;

  @Column()
  fieldOfStudy: string;

  @Column()
  grade: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column()
  ipfsCid: string;

  @Column({ type: 'enum', enum: CredentialStatus, default: CredentialStatus.VALID })
  status: CredentialStatus;

  @Column({ nullable: true })
  revocationReason: string;

  @Column({ nullable: true })
  revokedAt: Date;

  @ManyToOne(() => Institution, (i) => i.credentials)
  @JoinColumn({ name: 'institutionId' })
  institution: Institution;

  @Column()
  institutionId: string;

  @Index()
  @Column({ generated: 'uuid', unique: true })
  shareSlug: string;

  @CreateDateColumn()
  createdAt: Date;
}
