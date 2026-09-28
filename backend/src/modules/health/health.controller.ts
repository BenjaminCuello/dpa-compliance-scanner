import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import { tooManyRequestsError } from '../../common/swagger/error-examples';
import { Public } from '../auth/decorators';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Verifica el estado del backend y sus dependencias',
  })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiErrorResponses(tooManyRequestsError('/api/health'))
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
