import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private service: VerificationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Verify credential by ID (public, no auth)' })
  verifyById(@Param('id') id: string) {
    return this.service.verifyById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Verify credential by share slug (public)' })
  verifyBySlug(@Param('slug') slug: string) {
    return this.service.verifyBySlug(slug);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk verify credential IDs (public)' })
  bulkVerify(@Body('ids') ids: string[]) {
    return this.service.bulkVerify(ids);
  }
}
