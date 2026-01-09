import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createVietnameseSearchCondition } from '@app/common/utils/search.utils';
import { RequestListAssessmentMethodDto } from './dto/request/request-list-assessment-method.dto';
import { ASSESSMENT_METHOD_TABLES } from './constants/assessment-method-query';

@Injectable()
export class AssessmentMethodsQueries {
  getAssessmentMethodsList(dto: RequestListAssessmentMethodDto) {
    const { search, isActive, take, skip } = dto;
    const ASSESSMENT_METHOD = ASSESSMENT_METHOD_TABLES.ASSESSMENT_METHOD;

    const conditions: Prisma.Sql[] = [];
    if (search) {
      conditions.push(createVietnameseSearchCondition('name', search));
    }
    if (isActive !== undefined) {
      conditions.push(Prisma.sql`${ASSESSMENT_METHOD.isActive} = ${isActive}`);
    }

    const whereClause = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const dataQuery = Prisma.sql`
      SELECT 
        ${ASSESSMENT_METHOD.id}, 
        ${ASSESSMENT_METHOD.name}, 
        ${ASSESSMENT_METHOD.description}, 
        ${ASSESSMENT_METHOD.isActive}, 
        ${ASSESSMENT_METHOD.createdAt}, 
        ${ASSESSMENT_METHOD.updatedAt}
      FROM ${ASSESSMENT_METHOD.table}
      ${whereClause}
      ORDER BY ${ASSESSMENT_METHOD.createdAt} DESC
      LIMIT ${take} OFFSET ${skip}
    `;

    const countQuery = Prisma.sql`
      SELECT COUNT(*)::INT FROM ${ASSESSMENT_METHOD.table}
      ${whereClause}
    `;

    return { dataQuery, countQuery };
  }
}
