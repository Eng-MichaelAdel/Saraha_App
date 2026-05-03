import { HttpAppError } from "./error.app.js";

export class BadRequestException extends HttpAppError {
  constructor(message = "Invalid input / missing required data", details) {
    super(message, 400, "BadRequest", details);
  }
}

export class UnauthorizedException extends HttpAppError {
  constructor(message = "No token OR invalid token", details) {
    super(message, 401, "Unauthorized", details);
  }
}

export class ForbiddenException extends HttpAppError {
  constructor(message = "Authenticated but no permission", details) {
    super(message, 403, "Forbidden", details);
  }
}

export class NotFoundException extends HttpAppError {
  constructor(message = "Resource doesn’t exist", details) {
    super(message, 404, "NotFound", details);
  }
}

export class ConflictException extends HttpAppError {
  constructor(message = "Resource doesn’t exist", details) {
    super(message, 409, "Conflict", details);
  }
}

export class TooManyRequestsException extends HttpAppError {
  constructor(message = "Too Many Requests", details) {
    super(message, 429, "Too_Many_Requests", details);
  }
}
