import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { fileOption } from '@app/config/image-multer-config';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUsersDto } from '@UsersModule/dto/get-users.dto';
import { UpdateUserDto } from '@UsersModule/dto/update-user.dto';
import { UpdateForgotPasswordUserDto } from '@UsersModule/dto/update-forgot-password';
import { UsersService } from '@UsersModule/users.service';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/request/create-user.dto';
import { Public } from '../auth/guards/decorator/public.decorator';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto';
import { GetStatusSummaryDto } from './dto/get-status-summary.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @UseInterceptors(FileInterceptor('avatar', fileOption()))
  async create(
    @UploadedFile()
    // avatar: Express.Multer.File,
    @Body()
    createUserDto: CreateUserDto
  ) {
    return await this.usersService.create(createUserDto);
  }

  @Patch('reset-password/:id')
  async resetPassword(@Param('id', ParseIntPipe) id: string): Promise<ResponseItem<UserDto>> {
    return await this.usersService.resetPassword(id);
  }

  @Post('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto): Promise<ResponseItem<UserDto>> {
    return await this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get()
  @Public()
  async getUsers(@Query() queries: GetUsersByAdminDto): Promise<ResponsePaginate<UserDto>> {
    return await this.usersService.getUsers(queries);
  }

  @Get('status-summary')
  @Public()
  async getStatusSummary(): Promise<ResponseItem<GetStatusSummaryDto>> {
    return await this.usersService.getStatusSummary();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse({ status: 201, description: 'Get profile success' })
  @ApiResponse({ status: 400, description: 'Get profile failed' })
  async getProfile(@Req() req): Promise<ResponseItem<ProfileDto>> {
    return await this.usersService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 201, description: 'Update profile successfully' })
  @ApiResponse({ status: 400, description: 'Update profile failed' })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateProfileUserDto): Promise<ResponseItem<UserDto>> {
    return await this.usersService.updateProfile(req.user.userId, updateUserDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', fileOption()))
  async uploadAvatar(
    @Req() req,
    @UploadedFile()
    avatar: Express.Multer.File
  ): Promise<ResponseItem<UserDto>> {
    if (avatar) {
      return await this.usersService.uploadAvatar(req.user.userId, avatar);
    }
    throw new BadRequestException('Hình ảnh không hợp lệ');
  }

  @Delete('avatar')
  async removeAvatar(@Req() req): Promise<ResponseItem<UserDto>> {
    return await this.usersService.removeAvatar(req.user.userId);
  }

  @ApiTags('users')
  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<ResponseItem<boolean>> {
    return await this.usersService.sendForgotPassword(email);
  }

  @Public()
  @Post('/check-reset-token')
  @ApiOperation({ summary: 'Check reset password token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Token is invalid or expired' })
  async checkResetToken(@Body('token') token: string): Promise<ResponseItem<boolean>> {
    return await this.usersService.checkResetToken(token);
  }

  @ApiTags('users')
  @Public()
  @Post('/update-forgot-password')
  async updateForgotPassword(
    @Body() updateForgotPasswordUserDto: UpdateForgotPasswordUserDto
  ): Promise<ResponseItem<boolean>> {
    return await this.usersService.updateNewPassword(updateForgotPasswordUserDto);
  }
}
