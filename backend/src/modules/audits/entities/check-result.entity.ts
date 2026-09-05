import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CheckSeverity, CheckStatus } from '../enums';
import { Audit } from './audit.entity';

/** Resultado de un control técnico evaluado durante una auditoría. */
@Entity('check_results')
@Index('idx_check_results_audit_status', ['audit', 'status'])
export class CheckResult extends BaseEntity {
  @ManyToOne(() => Audit, (audit) => audit.checkResults, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  audit: Audit;

  /** Identificador del control en el catálogo, por ejemplo DPA-001. */
  @Column({ type: 'varchar', length: 80 })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'enum', enum: CheckStatus })
  status: CheckStatus;

  @Column({ type: 'enum', enum: CheckSeverity })
  severity: CheckSeverity;

  /** Detalle del hallazgo o de la evidencia que sustenta el resultado. */
  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @Column({ type: 'integer', nullable: true })
  lineNumber: number | null;
}
