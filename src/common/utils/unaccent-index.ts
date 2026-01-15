import { Prisma, PrismaClient } from '@prisma/client';

type UnaccentIndexTarget = {
  table: string;
  column: string;
  indexName: string;
  schema?: string;
};

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

const assertIdentifier = (value: string, label: string): string => {
  if (!SAFE_IDENTIFIER.test(value)) {
    throw new Error(`Invalid identifier for ${label}`);
  }
  return value;
};

export const ensureUnaccentIndex = async (prisma: PrismaClient, target: UnaccentIndexTarget): Promise<void> => {
  const schema = assertIdentifier(target.schema ?? 'public', 'schema');
  const table = assertIdentifier(target.table, 'table');
  const column = assertIdentifier(target.column, 'column');
  const indexName = assertIdentifier(target.indexName, 'indexName');

  const existsRows = await prisma.$queryRaw<{ exists: boolean }[]>(
    Prisma.sql`
      SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = ${schema}
          AND indexname = ${indexName}
      ) AS "exists"
    `
  );
  if (existsRows[0]?.exists) return;

  const fullTable = schema === 'public' ? `"${table}"` : `"${schema}"."${table}"`;
  const fullIndexName = `"${indexName}"`;
  const columnRef = `"${column}"`;

  await prisma.$executeRaw(
    Prisma.sql`
      CREATE INDEX IF NOT EXISTS ${Prisma.raw(fullIndexName)}
      ON ${Prisma.raw(fullTable)} (unaccent_immutable(lower(${Prisma.raw(columnRef)})))
    `
  );
};
