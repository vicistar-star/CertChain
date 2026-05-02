import {
  Controller, Post, Get, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CredentialsService, IssueCredentialDto, BulkIssueDto } from './credentials.service';
import { InstitutionsService } from '../institutions/institutions.service';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('credentials')
@Controller('credentials')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class CredentialsController {
  constructor(
    private credentialsService: CredentialsService,
    private institutionsService: InstitutionsService,
  ) {}

  @Post()
  @Roles('INSTITUTION')
  @ApiOperation({ summary: 'Issue a single credential' })
  async issue(@Request() req, @Body() dto: IssueCredentialDto) {
    const institution = await this.institutionsService.findById(req.user.id);
    return this.credentialsService.issueCredential(institution, dto);
  }

  @Post('bulk')
  @Roles('INSTITUTION')
  @ApiOperation({ summary: 'Bulk issue credentials from CSV data' })
  async bulkIssue(@Request() req, @Body() dto: BulkIssueDto) {
    const institution = await this.institutionsService.findById(req.user.id);
    return this.credentialsService.bulkIssue(institution, dto);
  }

  @Get('bulk/:jobId')
  @Roles('INSTITUTION')
  @ApiOperation({ summary: 'Get bulk issuance job status' })
  getBulkStatus(@Param('jobId') jobId: string) {
    return this.credentialsService.getBulkJobStatus(jobId);
  }

  @Get()
  @Roles('INSTITUTION')
  @ApiOperation({ summary: 'List institution credentials' })
  list(@Request() req) {
    return this.credentialsService.listByInstitution(req.user.id);
  }

  @Delete(':id')
  @Roles('INSTITUTION')
  @ApiOperation({ summary: 'Revoke a credential' })
  async revoke(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const institution = await this.institutionsService.findById(req.user.id);
    return this.credentialsService.revokeCredential(institution, id, reason);
  }
}
