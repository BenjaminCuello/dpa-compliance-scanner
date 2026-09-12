import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Project } from '../projects/entities/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { User } from '../users/entities/user.entity';
import { StartAuditDto } from './dto/start-audit.dto';
import { InvalidRepositoryUrlError } from './repository/repository.errors';
import { parseRepositoryUrl } from './repository/repository-url';

/** Determina sobre qué proyecto del usuario se ejecuta una auditoría. */
@Injectable()
export class AuditProjectResolver {
  constructor(
    private readonly projects: ProjectsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Usa el proyecto indicado o, si se entrega una URL, el proyecto asociado a
   * ese repositorio, creándolo en su primera auditoría.
   * @throws BadRequestException si se envían ambos datos o la URL no es válida.
   * @throws NotFoundException si el proyecto no pertenece al usuario.
   */
  async resolve(user: User, dto: StartAuditDto): Promise<Project> {
    if (dto.projectId && dto.repositoryUrl) {
      throw new BadRequestException(
        'Indica la URL del repositorio o el proyecto, no ambos',
      );
    }

    if (dto.projectId) {
      return this.projects.findOwned(dto.projectId, user);
    }

    let reference: ReturnType<typeof parseRepositoryUrl>;

    try {
      reference = parseRepositoryUrl(
        dto.repositoryUrl ?? '',
        this.config.get<string[]>('audits.allowedGitHosts', []),
      );
    } catch (error) {
      if (error instanceof InvalidRepositoryUrlError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }

    return this.projects.findOrCreate(
      user,
      reference.url,
      dto.projectName?.trim() || reference.path,
    );
  }
}
