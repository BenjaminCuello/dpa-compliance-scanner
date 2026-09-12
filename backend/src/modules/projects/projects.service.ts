import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';

/** Acceso a los proyectos de cada usuario. */
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  /**
   * Busca un proyecto del usuario.
   * @throws NotFoundException si no existe o pertenece a otra persona; se
   * responde igual en ambos casos para no revelar proyectos ajenos.
   */
  async findOwned(projectId: string, owner: User): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, owner: { id: owner.id } },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  /**
   * Devuelve el proyecto del usuario asociado al repositorio, creándolo si es
   * la primera auditoría de ese repositorio.
   * @param repositoryUrl URL ya normalizada.
   * @param defaultName Nombre a usar si el proyecto se crea.
   * @throws ConflictException si el nombre ya lo usa otro proyecto del usuario.
   */
  async findOrCreate(
    owner: User,
    repositoryUrl: string,
    defaultName: string,
  ): Promise<Project> {
    const existing = await this.projectsRepository.findOne({
      where: { repositoryUrl, owner: { id: owner.id } },
    });

    if (existing) {
      return existing;
    }

    const nameTaken = await this.projectsRepository.exists({
      where: { name: defaultName, owner: { id: owner.id } },
    });

    if (nameTaken) {
      throw new ConflictException(
        `Ya tienes un proyecto llamado "${defaultName}" con otro repositorio`,
      );
    }

    return this.projectsRepository.save(
      this.projectsRepository.create({
        name: defaultName,
        repositoryUrl,
        owner: { id: owner.id },
      }),
    );
  }
}
