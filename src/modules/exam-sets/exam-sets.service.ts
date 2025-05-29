import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class ExamSetsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExamSetDto: CreateExamSetDto) {
    return 'This action adds a new examSet';
  }

  findAll() {}

  findOne(id: string) {
    return `This action returns a #${id} examSet`;
  }

  update(id: string, updateExamSetDto: UpdateExamSetDto) {
    return `This action updates a #${id} examSet`;
  }

  remove(id: string) {
    return `This action removes a #${id} examSet`;
  }

  async getExamSetWithQuestions(examName: string): Promise<ResponseItem<GetExamSetDto>> {
    if (examName !== 'AI INPUT TEST') {
      throw new NotFoundException('Giá trị truyền vào không đúng');
    }

    const examSet = await this.prisma.examSet.findFirst({
      where: { name: 'AI INPUT TEST' },
      include: {
        exams: true,
        questions: {
          include: {
            question: {
              include: {
                answerOptions: true,
                criteria: true,
                level: true,
              },
            },
          },
          orderBy: {
            question: {
              sequence: 'asc',
            },
          },
        },
      },
    });

    if (!examSet) {
      throw new NotFoundException('Không tìm thấy bộ đề thi');
    }

    const examSetData = {
      id: examSet.id,
      name: examSet.name,
      description: examSet.description,
      questions: examSet.questions.map((qSet) => {
        const q = qSet.question;
        return {
          id: q.id,
          type: q.type,
          content: q.content,
          subcontent: q.subcontent,
          image: q.image,
          sequence: q.sequence,
          answerOptions: q.answerOptions.map((a) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
          })),
        };
      }),
    };
    return new ResponseItem(examSetData, 'Thành công nhận bộ đề thi', GetExamSetDto);
  }
}
