import { Injectable } from '@nestjs/common';
import { AspectListRequestDto } from './dto/request/aspect-list.request.dto';
import { CTE, ASPECT_TABLES } from './constants/aspect-query';
import { Prisma } from '@prisma/client';
import { createVietnameseSearchCondition } from '@app/common/utils';

@Injectable()
export class AspectsQueries {
  /**
   * Generates and Executes the Raw SQL Query for Aspect List with Status.
   */
  async getAspectsList(query: AspectListRequestDto): Promise<{ dataQuery: Prisma.Sql; countQuery: Prisma.Sql }> {
    const { take, skip, search, pillarId, status, assessmentMethodId } = query;

    // 1. Base Filters (Search, Pillar, Status, AssessmentMethod)
    const baseConditions: Prisma.Sql[] = [];
    if (search) {
      const searchPattern = search.trim();
      // Manual vietnamese search with proper aliasing
      baseConditions.push(createVietnameseSearchCondition('name', searchPattern));
    }
    if (pillarId) {
      baseConditions.push(Prisma.sql`${ASPECT_TABLES.ASPECT.pillarId} = ${pillarId}::uuid`);
    }
    if (status) {
      baseConditions.push(Prisma.sql`${ASPECT_TABLES.ASPECT.status}::text = ${status}`);
    }
    if (assessmentMethodId) {
      baseConditions.push(
        Prisma.sql`EXISTS (
            SELECT 1 FROM ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.table}
            WHERE ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.competencyAspectId} = ${ASPECT_TABLES.ASPECT.id}
            AND ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.assessmentMethodId} = ${assessmentMethodId}::uuid
        )`
      );
    }

    const finalWhereSql =
      baseConditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(baseConditions, ' AND ')}` : Prisma.empty;

    // 2. CTE Query Definition - Filter aspects first
    const queryHeader = Prisma.sql`
      WITH ${CTE.ASPECT_DATA} AS (
        SELECT 
          ${ASPECT_TABLES.ASPECT.id},
          ${ASPECT_TABLES.ASPECT.name},
          ${ASPECT_TABLES.ASPECT.pillarId},
          ${ASPECT_TABLES.ASPECT.createdAt},
          ${ASPECT_TABLES.ASPECT.status}
        FROM ${ASPECT_TABLES.ASPECT.table}
        ${finalWhereSql}
      )
    `;

    // 3. Main query - Join assessment methods after filtering
    const dataQuery = Prisma.sql`
        ${queryHeader}
        SELECT 
          ${ASPECT_TABLES.ASPECT.id},
          ${ASPECT_TABLES.ASPECT.name},
          ${ASPECT_TABLES.ASPECT.pillarId},
          ${ASPECT_TABLES.ASPECT.createdAt},
          ${ASPECT_TABLES.ASPECT.status},
          COALESCE(
            (
              SELECT json_agg(json_build_object('id', ${ASPECT_TABLES.ASSESSMENT_METHOD.id}, 'name', ${ASPECT_TABLES.ASSESSMENT_METHOD.name},'weight_within_dimension', ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.weightWithinDimension}))
              FROM ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.table}
              JOIN ${ASPECT_TABLES.ASSESSMENT_METHOD.table} ON ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.assessmentMethodId} = ${ASPECT_TABLES.ASSESSMENT_METHOD.id}
              WHERE ${ASPECT_TABLES.ASPECT_ASSESSMENT_METHOD.competencyAspectId} = ${ASPECT_TABLES.ASPECT.id}
            ),
            '[]'
          ) as assessment_methods
        FROM ${CTE.ASPECT_DATA} ${CTE.COMPETENCY_ASPECT}
        ORDER BY ${ASPECT_TABLES.ASPECT.createdAt} DESC
        LIMIT ${take} OFFSET ${skip}
      `;

    // Runs directly on table with filters, skipping JSON aggregation CTE
    const countQuery = Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM ${ASPECT_TABLES.ASPECT.table}
        ${finalWhereSql}
      `;

    return { dataQuery, countQuery };
  }
}
