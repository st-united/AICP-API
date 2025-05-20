import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '@UsersModule/users.service';
import { GetMentorsDto } from './dto/request/get-mentors.dto';

@Injectable()
export class MentorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService
  ) {}

  async create(createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const checkUser = await this.userService.findById(createMentorDto.userId);
    if (!checkUser) {
      throw new NotFoundException('Không tìm thấy ID user');
    }
    const mentor = await this.prisma.mentor.create({
      data: createMentorDto,
    });

    return new ResponseItem(mentor, 'Tạo mentor thành công', MentorResponseDto);
  }

  async getMentors(params: GetMentorsDto): Promise<ResponsePaginate<MentorResponseDto>> {
    const where = {
      isActive: params.status ? params.status : true,
    };

    const [result, total] = await this.prisma.$transaction([
      this.prisma.mentor.findMany({
        where,
        orderBy: { [params.orderBy]: params.order },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.mentor.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

    return new ResponsePaginate(result, pageMetaDto, 'Lấy danh sách mentor thành công');
  }

  async getMentor(id: string): Promise<ResponseItem<MentorResponseDto>> {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    return new ResponseItem(mentor, 'Lấy thông tin mentor thành công', MentorResponseDto);
  }

  async updateMentor(id: string, updateMentorDto: UpdateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const existingMentor = await this.prisma.mentor.findUnique({
      where: { id },
    });

    if (!existingMentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    const updatedMentor = await this.prisma.mentor.update({
      where: { id },
      data: updateMentorDto,
      include: {
        user: true,
      },
    });

    return new ResponseItem(updatedMentor, 'Cập nhật mentor thành công', MentorResponseDto);
  }

  async softRemoveMentor(id: string): Promise<ResponseItem<null>> {
    const existingMentor = await this.getMentor(id);

    if (existingMentor) {
      await this.prisma.mentor.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    }

    return new ResponseItem(null, 'Xóa mentor thành công');
  }
}
