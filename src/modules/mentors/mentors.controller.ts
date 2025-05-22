import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { GetMentorsDto } from './dto/request/get-mentors.dto';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { GetMenteesDto } from './dto/request/get-mentees.dto';
import { MenteesByMentorIdDto } from './dto/response/mentees-response.dto';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Post()
  create(@Body() createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    return this.mentorsService.create(createMentorDto);
  }

  @Get()
  async findAll(@Query() getMentors: GetMentorsDto): Promise<ResponsePaginate<MentorResponseDto>> {
    return await this.mentorsService.getMentors(getMentors);
  }
  @Get('/stats')
  async getMentorStats(): Promise<ResponseItem<MentorStatsDto>> {
    return await this.mentorsService.getMentorStats();
  }

  @Get('/mentees')
  getMentees(@Query() getMentees: GetMenteesDto): Promise<ResponsePaginate<MenteesByMentorIdDto>> {
    return this.mentorsService.getMenteesByMentorId(getMentees);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mentorsService.getMentor(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return this.mentorsService.updateMentor(id, updateMentorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseItem<null>> {
    return this.mentorsService.softRemoveMentor(id);
  }
}
