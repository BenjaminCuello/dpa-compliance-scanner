import { Module } from '@nestjs/common';
import { RuleCatalogService } from './catalog/rule-catalog.service';
import { ScannerService } from './scanner.service';
import { SemgrepRunnerService } from './semgrep/semgrep-runner.service';

@Module({
  providers: [ScannerService, RuleCatalogService, SemgrepRunnerService],
  exports: [ScannerService, RuleCatalogService],
})
export class ScannerModule {}
