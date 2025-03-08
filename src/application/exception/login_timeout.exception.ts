// src/application/exception/login-timeout.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export class LoginTimeoutException extends HttpException {
  constructor() {
    super(
      'Your session has expired. Please log in again.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
