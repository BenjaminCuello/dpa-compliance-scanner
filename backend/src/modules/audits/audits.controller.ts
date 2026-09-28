import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import {
  httpError,
  tooManyRequestsError,
  unauthorizedError,
  validationError,
} from '../../common/swagger/error-examples';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';
import { AuditsService } from './audits.service';
import { AuditDetailDto } from './dto/audit-detail.dto';
import { AuditListDto, AuditSummaryDto } from './dto/audit-summary.dto';
import { ListAuditsQueryDto } from './dto/list-audits-query.dto';
import { START_AUDIT_EXAMPLES, StartAuditDto } from './dto/start-audit.dto';

const AUDIT_ID_EXAMPLE = '3f2b8c1e-6d4a-4f7b-9c2e-1a5d8e7f6b40';

@ApiTags('Auditorías')
@ApiBearerAuth()
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  // Cada auditoría clona y analiza un repositorio: se limita más que el resto.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Inicia una auditoría',
    description:
      'Responde de inmediato con la auditoría en estado pending. El avance se consulta en GET /audits/{id}. ' +
      'Admite como máximo 5 solicitudes por minuto por cliente, además del límite global.',
  })
  @ApiBody({ type: StartAuditDto, examples: START_AUDIT_EXAMPLES })
  @ApiAcceptedResponse({ type: AuditSummaryDto })
  @ApiErrorResponses(
    validationError(
      '/api/audits',
      [
        'Indica la URL del repositorio o el proyecto',
        'La URL del repositorio debe ser texto',
        'La URL del repositorio no puede superar los 500 caracteres',
      ],
      'URL, nombre o proyecto inválidos, o se enviaron URL y proyecto a la vez',
    ),
    unauthorizedError('/api/audits'),
    httpError(
      404,
      '/api/audits',
      'El proyecto no existe o pertenece a otro usuario',
      'Proyecto no encontrado',
    ),
    httpError(
      409,
      '/api/audits',
      'El proyecto ya tiene una auditoría en curso, o el nombre ya está en uso',
      'El proyecto ya tiene una auditoría en curso',
    ),
    tooManyRequestsError(
      '/api/audits',
      'Se superaron las 5 auditorías por minuto o el límite global',
    ),
  )
  start(
    @CurrentUser() user: User,
    @Body() dto: StartAuditDto,
  ): Promise<AuditSummaryDto> {
    return this.auditsService.start(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Historial de auditorías del usuario, filtrable por proyecto',
  })
  @ApiOkResponse({ type: AuditListDto })
  @ApiErrorResponses(
    validationError(
      '/api/audits?limit=500',
      ['El límite no puede superar 100 resultados'],
      'Filtros o paginación inválidos',
    ),
    unauthorizedError('/api/audits'),
    tooManyRequestsError('/api/audits'),
  )
  list(
    @CurrentUser() user: User,
    @Query() query: ListAuditsQueryDto,
  ): Promise<AuditListDto> {
    return this.auditsService.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Estado y resultados de una auditoría' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identificador de la auditoría (UUID v4)',
    example: AUDIT_ID_EXAMPLE,
  })
  @ApiOkResponse({ type: AuditDetailDto })
  @ApiErrorResponses(
    httpError(
      400,
      '/api/audits/123',
      'El identificador no es un UUID v4',
      'Validation failed (uuid v 4 is expected)',
    ),
    unauthorizedError(`/api/audits/${AUDIT_ID_EXAMPLE}`),
    httpError(
      404,
      `/api/audits/${AUDIT_ID_EXAMPLE}`,
      'La auditoría no existe o pertenece a otro usuario',
      'Auditoría no encontrada',
    ),
    tooManyRequestsError(`/api/audits/${AUDIT_ID_EXAMPLE}`),
  )
  findOne(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AuditDetailDto> {
    return this.auditsService.findOne(user, id);
  }
}
