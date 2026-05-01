import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsString, IsIn } from 'class-validator';

class ChallengeDto {
  @IsString() publicKey: string;
}

class VerifyDto {
  @IsString() publicKey: string;
  @IsString() signedXdr: string;
  @IsIn(['INSTITUTION', 'GRADUATE']) role: 'INSTITUTION' | 'GRADUATE';
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('challenge')
  @ApiOperation({ summary: 'Get SEP-10 challenge transaction' })
  getChallenge(@Body() dto: ChallengeDto) {
    return this.authService.getChallenge(dto.publicKey);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signed challenge and receive JWT' })
  verify(@Body() dto: VerifyDto) {
    return this.authService.verifyAndLogin(dto.publicKey, dto.signedXdr, dto.role);
  }
}
