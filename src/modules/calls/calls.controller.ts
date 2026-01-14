import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { InitiateCallDto } from './dtos/initiate-call.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorators';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private callsService: CallsService) {}

  @Post('initiate')
  async initiateCall(@AuthUser() user: any, @Body() dto: InitiateCallDto) {
    return this.callsService.initiateCall(
      user.userId,
      dto.receiverId,
      dto.costPerMinute || 50,
    );
  }

  @Post(':id/end')
  async endCall(@AuthUser() user: any, @Param('id') callId: string) {
    return this.callsService.endCall(callId, user.userId);
  }

  @Get('history')
  async getCallHistory(@AuthUser() user: any, @Query('limit') limit?: number) {
    return this.callsService.getCallHistory(user.userId, limit || 20);
  }

  @Get(':id')
  async getCall(@Param('id') callId: string) {
    return this.callsService.getCallById(callId);
  }
}
