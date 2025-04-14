// src/assembly/assembly.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssemblyService } from './services/assemblyai.service';
import { AssemblyController } from './controllers/assemblyai.controller';
import { Assembly } from './entities/assemblyai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assembly])],
  providers: [AssemblyService],
  controllers: [AssemblyController],
  exports: [AssemblyService],
})
export class AssemblyModule {}
