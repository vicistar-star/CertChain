import {
  Controller, Get, Put, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InstitutionsService } from './institutions.service';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private service: InstitutionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get institution profile (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('INSTITUTION')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update institution profile' })
  updateProfile(@Request() req, @Body() body: Partial<any>) {
    return this.service.updateProfile(req.user.id, body);
  }

  @Get('me/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('INSTITUTION')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get issuance analytics' })
  getStats(@Request() req) {
    return this.service.getStats(req.user.id);
  }
}
