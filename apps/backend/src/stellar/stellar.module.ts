import { Module, Global } from '@nestjs/common';
import { StellarService } from './stellar.service';
import { SorobanService } from './soroban.service';

@Global()
@Module({
  providers: [StellarService, SorobanService],
  exports: [StellarService, SorobanService],
})
export class StellarModule {}
