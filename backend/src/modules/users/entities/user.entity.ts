import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';

/** Persona que utiliza la plataforma y es dueña de los proyectos auditados. */
@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  email: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  /** Solo se incluye en la consulta cuando se pide de forma explícita. */
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];
}
