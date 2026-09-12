import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { parse } from 'yaml';
import { CheckSeverity } from '../../audits/enums';
import { InvalidRuleCatalogError } from '../errors/scanner.errors';
import {
  CheckCategory,
  CheckDefinition,
} from '../interfaces/check-definition.interface';

interface RawRule {
  id?: unknown;
  metadata?: Record<string, unknown>;
}

const CATEGORIES = new Set<string>(['secrets', 'configuration']);
const SEVERITIES = new Set<string>(Object.values(CheckSeverity));
const REQUIRED_METADATA = [
  'dpa-code',
  'title',
  'category',
  'dpa-severity',
  'remediation',
];

/**
 * Catálogo de controles construido a partir de las reglas de Semgrep.
 * Se carga al iniciar la aplicación para detectar de inmediato reglas mal
 * definidas, en lugar de descubrirlo durante una auditoría.
 */
@Injectable()
export class RuleCatalogService implements OnModuleInit {
  private checks: CheckDefinition[] = [];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.load();
  }

  /** Controles disponibles, ordenados por código. */
  getChecks(): CheckDefinition[] {
    return this.checks;
  }

  /** Lee y valida todas las reglas de la carpeta configurada. */
  async load(): Promise<CheckDefinition[]> {
    const rulesDir = this.config.get<string>(
      'scanner.rulesDir',
      'semgrep/rules',
    );
    const files = (await readdir(rulesDir))
      .filter((file) => ['.yml', '.yaml'].includes(extname(file)))
      .sort();

    const byCode = new Map<string, CheckDefinition>();

    for (const file of files) {
      const content = parse(await readFile(join(rulesDir, file), 'utf8')) as {
        rules?: RawRule[];
      };

      for (const rule of content?.rules ?? []) {
        this.register(byCode, this.validate(rule, file));
      }
    }

    if (byCode.size === 0) {
      throw new InvalidRuleCatalogError(
        `No se encontraron reglas en ${rulesDir}`,
      );
    }

    this.checks = [...byCode.values()].sort((a, b) =>
      a.code.localeCompare(b.code),
    );
    return this.checks;
  }

  private validate(rule: RawRule, file: string): CheckDefinition {
    const metadata = rule.metadata ?? {};
    const missing = REQUIRED_METADATA.filter(
      (key) =>
        typeof metadata[key] !== 'string' || !String(metadata[key]).trim(),
    );

    if (typeof rule.id !== 'string' || missing.length > 0) {
      throw new InvalidRuleCatalogError(
        `Regla incompleta en ${file}: faltan ${missing.join(', ') || 'id'}`,
      );
    }

    const category = String(metadata['category']);
    const severity = String(metadata['dpa-severity']);

    if (!CATEGORIES.has(category) || !SEVERITIES.has(severity)) {
      throw new InvalidRuleCatalogError(
        `La regla ${rule.id} declara una categoría o severidad desconocida`,
      );
    }

    return {
      code: String(metadata['dpa-code']),
      title: String(metadata['title']),
      category: category as CheckCategory,
      severity: severity as CheckSeverity,
      remediation: String(metadata['remediation']).trim(),
      ruleIds: [rule.id],
    };
  }

  /** Agrupa bajo un mismo control las reglas que comparten código. */
  private register(
    byCode: Map<string, CheckDefinition>,
    check: CheckDefinition,
  ): void {
    const existing = byCode.get(check.code);

    if (existing) {
      existing.ruleIds.push(...check.ruleIds);
      return;
    }

    byCode.set(check.code, check);
  }
}
