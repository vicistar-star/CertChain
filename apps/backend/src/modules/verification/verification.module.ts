import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from '../credentials/entities/credential.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
