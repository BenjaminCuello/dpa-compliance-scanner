import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788626882497 implements MigrationInterface {
  name = 'InitialSchema1788626882497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(180) NOT NULL, "name" character varying(120) NOT NULL, "password_hash" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "description" text, "repository_url" character varying(500) NOT NULL, "owner_id" uuid NOT NULL, CONSTRAINT "uq_projects_owner_name" UNIQUE ("owner_id", "name"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1bd2fbf5d0ef67319c91acb5c" ON "projects"  ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."check_results_status_enum" AS ENUM('passed', 'failed', 'skipped')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."check_results_severity_enum" AS ENUM('low', 'medium', 'high', 'critical')`,
    );
    await queryRunner.query(
      `CREATE TABLE "check_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(80) NOT NULL, "title" character varying(200) NOT NULL, "status" "public"."check_results_status_enum" NOT NULL, "severity" "public"."check_results_severity_enum" NOT NULL, "details" text, "file_path" character varying(500), "line_number" integer, "audit_id" uuid NOT NULL, CONSTRAINT "PK_2af4caf20da46ce834ba71ad38f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_check_results_audit_status" ON "check_results"  ("audit_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audits_status_enum" AS ENUM('pending', 'running', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."audits_status_enum" NOT NULL DEFAULT 'pending', "compliance_score" numeric(5,2), "started_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, "error_message" text, "project_id" uuid NOT NULL, CONSTRAINT "PK_b2d7a2089999197dc7024820f28" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c9d0f6de35b9acbe098998faf" ON "audits"  ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_778ac560a42329b96e41de5d92" ON "audits"  ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_results" ADD CONSTRAINT "FK_3a44c392702d4d51a5b95bd4f35" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audits" ADD CONSTRAINT "FK_0c9d0f6de35b9acbe098998faf0" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audits" DROP CONSTRAINT "FK_0c9d0f6de35b9acbe098998faf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_results" DROP CONSTRAINT "FK_3a44c392702d4d51a5b95bd4f35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_778ac560a42329b96e41de5d92"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c9d0f6de35b9acbe098998faf"`,
    );
    await queryRunner.query(`DROP TABLE "audits"`);
    await queryRunner.query(`DROP TYPE "public"."audits_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_check_results_audit_status"`,
    );
    await queryRunner.query(`DROP TABLE "check_results"`);
    await queryRunner.query(`DROP TYPE "public"."check_results_severity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."check_results_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b1bd2fbf5d0ef67319c91acb5c"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
