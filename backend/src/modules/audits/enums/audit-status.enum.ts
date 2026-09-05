/** Etapas por las que pasa una auditoría desde que se solicita. */
export enum AuditStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
