export class BaseResponse extends Error {
  constructor(
    message: string,
    name = 'Internal Server',
    public statusCode = 500
  ) {
    super(message)
    this.name = name
  }
}

export class BadRequest extends BaseResponse {
  constructor(message: string) {
    super(message, 'Bad Request', 400)
  }
}

export class Unauthorized extends BaseResponse {
  constructor(message: string) {
    super(message, 'Unauthorized', 401)
  }
}

export class Forbidden extends BaseResponse {
  constructor(message: string) {
    super(message, 'Forbidden', 403)
  }
}

export class NotFound extends BaseResponse {
  constructor(message: string) {
    super(message, 'Not Found', 404)
  }
}

export class InternalServer extends BaseResponse {
  constructor(message: string) {
    super(message, 'Internal Server', 500)
  }
}

const ErrorResponse = { BadRequest, Forbidden, InternalServer, NotFound, Unauthorized }
export default ErrorResponse
