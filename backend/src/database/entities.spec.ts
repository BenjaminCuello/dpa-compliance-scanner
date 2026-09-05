import { getMetadataArgsStorage } from 'typeorm';
import { Audit } from '../modules/audits/entities/audit.entity';
import { CheckResult } from '../modules/audits/entities/check-result.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { User } from '../modules/users/entities/user.entity';

describe('modelo de datos', () => {
  const storage = getMetadataArgsStorage();

  type EntityClass = new () => object;

  const tableOf = (target: EntityClass) =>
    storage.tables.find((table) => table.target === target);

  const relationsOf = (target: EntityClass) =>
    storage.relations.filter((relation) => relation.target === target);

  it('registra las cuatro entidades del dominio', () => {
    expect(tableOf(User)?.name).toBe('users');
    expect(tableOf(Project)?.name).toBe('projects');
    expect(tableOf(Audit)?.name).toBe('audits');
    expect(tableOf(CheckResult)?.name).toBe('check_results');
  });

  it('encadena proyecto, auditoría y resultado de check', () => {
    const projectOwner = relationsOf(Project).find(
      (relation) => relation.propertyName === 'owner',
    );
    const auditProject = relationsOf(Audit).find(
      (relation) => relation.propertyName === 'project',
    );
    const resultAudit = relationsOf(CheckResult).find(
      (relation) => relation.propertyName === 'audit',
    );

    expect(projectOwner?.relationType).toBe('many-to-one');
    expect(auditProject?.relationType).toBe('many-to-one');
    expect(resultAudit?.relationType).toBe('many-to-one');
  });

  it('borra en cascada los registros dependientes', () => {
    const owners = [Project, Audit, CheckResult].flatMap((entity) =>
      relationsOf(entity).filter(
        (relation) => relation.relationType === 'many-to-one',
      ),
    );

    expect(owners).toHaveLength(3);
    owners.forEach((relation) => {
      expect(relation.options.onDelete).toBe('CASCADE');
      expect(relation.options.nullable).toBe(false);
    });
  });

  it('no expone el hash de la contraseña en las consultas', () => {
    const passwordHash = storage.columns.find(
      (column) =>
        column.target === User && column.propertyName === 'passwordHash',
    );

    expect(passwordHash?.options.select).toBe(false);
  });
});
