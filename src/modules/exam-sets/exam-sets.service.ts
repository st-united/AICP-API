import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { PrismaClient } from '@prisma/client';
import { GetExamSetDto } from './dto/get-exam-set.dto';

@Injectable()
export class ExamSetsService {
  prisma = new PrismaClient();

  create(createExamSetDto: CreateExamSetDto) {
    return 'This action adds a new examSet';
  }

  findAll() {}

  findOne(id: number) {
    return `This action returns a #${id} examSet`;
  }

  update(id: number, updateExamSetDto: UpdateExamSetDto) {
    return `This action updates a #${id} examSet`;
  }

  remove(id: number) {
    return `This action removes a #${id} examSet`;
  }

  async getExamSetWithQuestions(examSetId: string): Promise<GetExamSetDto> {
    const examSet = await this.prisma.examSet.findUnique({
      where: { id: examSetId },
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
        },
      },
    });

    if (!examSet) {
      throw new NotFoundException('Exam set not found');
    }

    return {
      id: examSet.id,
      name: examSet.name,
      description: examSet.description,
      questions: examSet.questions.map((qSet) => {
        const q = qSet.question;
        return {
          id: q.id,
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
  }
}
