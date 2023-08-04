import {
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

const logger = new Logger('ControllerWrapper');

export default async function (next: Function) {
  try {
    return await next();
  } catch (error) {
    console.log(error);
    const userDefinedErrors = Object.keys(error?.errors || {});
    if (userDefinedErrors.length) {
      if (
        error?.errors[userDefinedErrors[0]]?.kind === 'user defined' ||
        error.message.startsWith('User validation failed')
      ) {
        throw new BadRequestException(
          error?.errors[userDefinedErrors[0]]?.message,
        );
      }
    }

    if (error.status) {
      throw error;
    }
    throw new InternalServerErrorException('There was an error');
  }
}
