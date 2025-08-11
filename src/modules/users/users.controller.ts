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
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateForgotPasswordUserDto } from '@UsersModule/dto/update-forgot-password';
import { UsersService } from '@UsersModule/users.service';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/request/create-user.dto';
import { Public } from '../auth/guards/decorator/public.decorator';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto';
import { GetStatusSummaryDto } from './dto/get-status-summary.dto';
import { GetPortfolioResponseDto } from './dto/get-portfolio-response.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PORTFOLIO_FILE_INTERCEPTOR } from '@app/validations/portfolio-validation';
import { DownloadPortfolioFileDto } from './dto/download-portfolio-file.dto';
import { Response } from 'express';
import { UpdateStudentInfoDto } from './dto/request/update-student-info.dto';
@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(
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
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Req() req, @UploadedFile() avatar: Express.Multer.File): Promise<ResponseItem<UserDto>> {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(avatar.mimetype)) {
      throw new BadRequestException('Định dạng ảnh không hợp lệ (chỉ nhận jpeg, png, webp)');
    }
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

  @ApiTags('users')
  @Patch('/portfolio')
  @ApiOperation({ summary: 'Update or create portfolio' })
  @ApiResponse({ status: 200, description: 'Portfolio updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid portfolio data or file format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not found' })
  @ApiResponse({ status: 413, description: 'Payload too large - File size exceeds limit' })
  @ApiResponse({ status: 415, description: 'Unsupported media type - Invalid file type' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePortfolioDto })
  @UseInterceptors(PORTFOLIO_FILE_INTERCEPTOR)
  async updatePortfolio(
    @Req() req,
    @Body() portfolioDto: UpdatePortfolioDto,
    @UploadedFiles()
    files: UpdatePortfolioDto
  ): Promise<ResponseItem<GetPortfolioResponseDto>> {
    return await this.usersService.updatePortfolio(req.user.userId, { ...portfolioDto, ...files });
  }

  @ApiTags('users')
  @Get('/portfolio')
  @ApiOperation({ summary: 'Get user portfolio' })
  @ApiResponse({ status: 200, description: 'Portfolio retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not found' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPortfolio(@Req() req): Promise<ResponseItem<GetPortfolioResponseDto>> {
    return await this.usersService.getPortfolio(req.user.userId);
  }

  @ApiTags('users')
  @Get('/portfolio/download')
  @ApiOperation({ summary: 'Download portfolio file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or filename' })
  @ApiResponse({ status: 500, description: 'Error downloading file' })
  async downloadFile(@Query() query: DownloadPortfolioFileDto, @Res() res: Response): Promise<void> {
    return await this.usersService.downloadFile(query.url, query.filename, res);
  }

  @ApiTags('users')
  @Patch('/student-info')
  @ApiOperation({ summary: 'Update student info' })
  @ApiResponse({ status: 200, description: 'Student info updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid student info' })
  async updateStudentInfo(@Body() updateStudentInfoDto: UpdateStudentInfoDto, @Req() req) {
    return await this.usersService.updateStudentInfo(req.user.userId, updateStudentInfoDto);
  }
}
