import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActiveAuditPerProject1789255826538 implements MigrationInterface {
  name = 'ActiveAuditPerProject1789255826538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_audits_active_per_project" ON "audits"  ("project_id") WHERE "status" IN ('pending', 'running')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."uq_audits_active_per_project"`,
    );
  }
}
