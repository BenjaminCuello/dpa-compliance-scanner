import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { ScannerModule } from '../scanner/scanner.module';
import { AuditProjectResolver } from './audit-project.resolver';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';
import { Audit } from './entities/audit.entity';
import { CheckResult } from './entities/check-result.entity';
import { AuditRunnerService } from './execution/audit-runner.service';
import { RepositoryFetcherService } from './repository/repository-fetcher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Audit, CheckResult]),
    ProjectsModule,
    ScannerModule,
  ],
  controllers: [AuditsController],
  providers: [
    AuditsService,
    AuditProjectResolver,
    AuditRunnerService,
    RepositoryFetcherService,
  ],
})
export class AuditsModule {}
