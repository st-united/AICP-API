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
import { UsersService } from '@UsersModule/users.service';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/request/create-user.dto';
import { Public } from '../auth/guards/decorator/public.decorator';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto.';
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
  @UseInterceptors(FileInterceptor('avatar', fileOption('users')))
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
  async getUsers(@Query() queries: GetUsersByAdminDto): Promise<ResponseItem<ResponsePaginate<UserDto>>> {
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

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: string): Promise<ResponseItem<null>> {
    return await this.usersService.deleteUser(id);
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: string): Promise<ResponseItem<UserDto>> {
    return await this.usersService.getUser(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ResponseItem<UserDto>> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Post('avatar/:id')
  @UseInterceptors(FileInterceptor('avatar', fileOption('users')))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile()
    avatar: Express.Multer.File
  ): Promise<any> {
    if (avatar) {
      return await this.usersService.uploadAvatar(id, avatar);
    }
    throw new BadRequestException('Hình ảnh không hợp lệ');
  }

  @Patch('avatar/:id')
  async removeAvatar(@Param('id') id: string): Promise<ResponseItem<UserDto>> {
    return await this.usersService.removeAvatar(id);
  }
}
