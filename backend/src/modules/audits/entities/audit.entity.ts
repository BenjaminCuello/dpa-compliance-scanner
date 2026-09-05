import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { AuditStatus } from '../enums';
import { CheckResult } from './check-result.entity';

/** Ejecución del escaneo sobre un proyecto en un momento determinado. */
@Entity('audits')
export class Audit extends BaseEntity {
  @Index()
  @ManyToOne(() => Project, (project) => project.audits, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  project: Project;

  @Index()
  @Column({ type: 'enum', enum: AuditStatus, default: AuditStatus.PENDING })
  status: AuditStatus;

  /** Porcentaje de controles cumplidos, disponible al finalizar la auditoría. */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  complianceScore: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt: Date | null;

  /** Motivo del fallo cuando el estado es FAILED. */
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @OneToMany(() => CheckResult, (checkResult) => checkResult.audit)
  checkResults: CheckResult[];
}
