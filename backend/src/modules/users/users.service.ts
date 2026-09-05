import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/** Datos necesarios para dar de alta a un usuario. */
export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

/** Acceso a los usuarios almacenados. */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Busca un usuario por su correo.
   * @param email Correo a buscar, sin distinguir mayúsculas.
   * @param includePassword Incluye el hash de la contraseña en el resultado.
   */
  findByEmail(email: string, includePassword = false): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      select: includePassword
        ? {
            id: true,
            email: true,
            name: true,
            isActive: true,
            passwordHash: true,
          }
        : undefined,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /** Crea el usuario normalizando el correo a minúsculas. */
  create(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      email: data.email.toLowerCase(),
    });

    return this.usersRepository.save(user);
  }
}
