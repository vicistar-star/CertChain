import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Credential } from '../../credentials/entities/credential.entity';

export enum InstitutionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACCREDITED = 'DEACCREDITED',
}

export enum InstitutionType {
  UNIVERSITY = 'UNIVERSITY',
  POLYTECHNIC = 'POLYTECHNIC',
  VOCATIONAL = 'VOCATIONAL',
  PROFESSIONAL = 'PROFESSIONAL',
}

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  stellarPublicKey: string;

  @Column()
  name: string;

  @Column({ length: 2 })
  countryCode: string;

  @Column()
  accreditationBody: string;

  @Column()
  accreditationId: string;

  @Column({ type: 'enum', enum: InstitutionType })
  institutionType: InstitutionType;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logoIpfsCid: string;

  @Column({ type: 'enum', enum: InstitutionStatus, default: InstitutionStatus.PENDING })
  status: InstitutionStatus;

  @Column({ nullable: true, select: false })
  signerSecret: string; // AES-256-GCM encrypted at rest

  @OneToMany(() => Credential, (c) => c.institution)
  credentials: Credential[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
