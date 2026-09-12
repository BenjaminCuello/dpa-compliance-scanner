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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';
import { AuditsService } from './audits.service';
import { AuditDetailDto } from './dto/audit-detail.dto';
import { AuditListDto, AuditSummaryDto } from './dto/audit-summary.dto';
import { ListAuditsQueryDto } from './dto/list-audits-query.dto';
import { StartAuditDto } from './dto/start-audit.dto';

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
      'Responde de inmediato con la auditoría en estado pending. El avance se consulta en GET /audits/{id}.',
  })
  @ApiAcceptedResponse({ type: AuditSummaryDto })
  @ApiBadRequestResponse({ description: 'URL o datos inválidos' })
  @ApiNotFoundResponse({ description: 'El proyecto no existe' })
  @ApiConflictResponse({
    description: 'El proyecto ya tiene una auditoría en curso',
  })
  @ApiTooManyRequestsResponse({
    description: 'Demasiadas auditorías en poco tiempo',
  })
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
  list(
    @CurrentUser() user: User,
    @Query() query: ListAuditsQueryDto,
  ): Promise<AuditListDto> {
    return this.auditsService.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Estado y resultados de una auditoría' })
  @ApiOkResponse({ type: AuditDetailDto })
  @ApiNotFoundResponse({ description: 'La auditoría no existe' })
  findOne(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AuditDetailDto> {
    return this.auditsService.findOne(user, id);
  }
}
