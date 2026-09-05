import { Column, Entity, Index, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Audit } from '../../audits/entities/audit.entity';
import { User } from '../../users/entities/user.entity';

/** Repositorio o proyecto sobre el que se ejecutan las auditorías. */
@Entity('projects')
@Unique('uq_projects_owner_name', ['owner', 'name'])
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500 })
  repositoryUrl: string;

  @Index()
  @ManyToOne(() => User, (user) => user.projects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => Audit, (audit) => audit.project)
  audits: Audit[];
}
