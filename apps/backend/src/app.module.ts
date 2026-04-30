import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './modules/auth/auth.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { VerificationModule } from './modules/verification/verification.module';
import { GraduatesModule } from './modules/graduates/graduates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StellarModule } from './stellar/stellar.module';
import { IpfsModule } from './ipfs/ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('REDIS_URL'),
      }),
    }),
    CacheModule.register({ isGlobal: true, ttl: 300_000 }),
    StellarModule,
    IpfsModule,
    AuthModule,
    InstitutionsModule,
    CredentialsModule,
    VerificationModule,
    GraduatesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
