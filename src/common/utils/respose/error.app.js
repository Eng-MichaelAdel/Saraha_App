export class HttpAppError extends Error {
  constructor(message, statusCode = 500, type = "Inernal Server Error", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
  }
}
