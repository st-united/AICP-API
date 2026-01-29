import { getSchemaPath } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { ResponseItem } from '@app/common/dtos';

export const singleResponseSchema = <TModel extends Type<any>>(model: TModel) => ({
  schema: {
    allOf: [
      { $ref: getSchemaPath(ResponseItem) },
      {
        properties: {
          data: { $ref: getSchemaPath(model) },
          message: { type: 'string', example: 'Thành công' },
        },
      },
    ],
  },
});

export const arrayResponseSchema = <TModel extends Type<any>>(model: TModel) => ({
  schema: {
    allOf: [
      { $ref: getSchemaPath(ResponseItem) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          message: { type: 'string', example: 'Thành công' },
        },
      },
    ],
  },
});
