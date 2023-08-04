import regx, { matchRegx } from '@shared/utils/regx';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsRegxMatch(
  property: RegExp,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsRegxMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return matchRegx(value, property);
        },
        defaultMessage(args: ValidationArguments) {
          return `Please provide valid value`;
        },
      },
    });
  };
}
