import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { isDev } from '../environment/isDev';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger();
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorFormat = {
      error: null,
      message: null,
      code: null,
      stack: undefined,
      path: undefined,
      payload: undefined,
    };

    errorFormat.path = ctx.getRequest().url;
    if (isDev()) {
      errorFormat.stack = exception.stack;
      errorFormat.payload = ctx.getRequest().body;
    }
    console.log('stack:', exception.stack);
    console.log('path:', errorFormat.path);
    console.log('payload:', ctx.getRequest().body);

    errorFormat.code = status;

    if (!exception.response) {
      errorFormat.message = exception.message;
      errorFormat.error = exception.error ?? exception.constructor.name;
      return response.status(status).json(errorFormat);
    }

    // if (exception instanceof RentifyError) {
    //   const rentifyResponse = exception.details?.response as any;
    //   errorFormat.code = exception.details?.status || status;
    //   errorFormat.message =
    //     rentifyResponse?.data.message ||
    //     rentifyResponse?.data.detail ||
    //     exception.message;
    //   errorFormat.error = exception.constructor.name;
    //   return response.status(errorFormat.code).json(errorFormat);
    // }

    const data = exception.response;

    errorFormat.message = data.message;
    errorFormat.error = data.error ?? exception.constructor.name;

    console.log('error:', errorFormat);

    return response.status(status).json(errorFormat);
  }
}
