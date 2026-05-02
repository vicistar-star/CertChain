import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Credential } from './entities/credential.entity';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { BulkIssueProcessor } from './bulk-issue.processor';
import { InstitutionsModule } from '../institutions/institutions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    BullModule.registerQueue({ name: 'credentials' }),
    InstitutionsModule,
    NotificationsModule,
  ],
  providers: [CredentialsService, BulkIssueProcessor],
  controllers: [CredentialsController],
  exports: [CredentialsService],
})
export class CredentialsModule {}
