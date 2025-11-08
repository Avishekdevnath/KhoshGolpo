import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminSecurityService } from '../services/admin-security.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListSecurityEventsQueryDto } from '../dto/list-security-events.query';
import { ListRateLimitQueryDto } from '../dto/list-rate-limit.query';
import type { SecurityEvent } from '@prisma/client';
import { PaginationMetaDto } from '../../threads/dto/thread-responses.dto';

class SecurityEventResponseDto {
  data!: SecurityEvent[];
  pagination!: PaginationMetaDto;
}

@ApiTags('Admin • Security')
@ApiBearerAuth('access-token')
@Roles('admin', 'moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/security')
export class AdminSecurityController {
  constructor(private readonly adminSecurityService: AdminSecurityService) {}

  @Get('events')
  @ApiOkResponse({
    description: 'Paginated security events matching the provided filters.',
    type: SecurityEventResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin or moderator role required.' })
  async listEvents(
    @Query() query: ListSecurityEventsQueryDto,
  ): Promise<SecurityEventResponseDto> {
    const result = await this.adminSecurityService.listEvents(query);
    return {
      data: result.data as SecurityEvent[],
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }

  @Get('rate-limit')
  @ApiOkResponse({
    description:
      'Aggregated view of rate-limit violations within the selected window.',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              key: { type: 'string' },
              count: { type: 'number' },
              lastOccurrence: { type: 'string', format: 'date-time' },
              sampleEndpoint: { type: 'string', nullable: true },
              sampleIp: { type: 'string', nullable: true },
              sampleUserId: { type: 'string', nullable: true },
            },
          },
        },
        groupBy: { type: 'string' },
        windowMinutes: { type: 'number' },
        totalActors: { type: 'number' },
      },
    },
  })
  async listRateLimitSummary(@Query() query: ListRateLimitQueryDto) {
    return this.adminSecurityService.listRateLimitSummary(query);
  }
}

