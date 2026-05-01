import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Graduate } from './entities/graduate.entity';
import { GraduatesService } from './graduates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Graduate])],
  providers: [GraduatesService],
  exports: [GraduatesService],
})
export class GraduatesModule {}
