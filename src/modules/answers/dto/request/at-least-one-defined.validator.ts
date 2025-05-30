import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneDefined', async: false })
export class AtLeastOneDefinedConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.answer || obj.answerId);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either "answer" or "answerId" must be provided.';
  }
}

export function AtLeastOneDefined(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: AtLeastOneDefinedConstraint,
    });
  };
}
