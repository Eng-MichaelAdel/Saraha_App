import { NODE_ENV } from "../../config/config.service.js";

const errorHandler = (error, req, res, next) => {
  let status;
  let message;

  status = error.cause?.status ?? 500;
  message = status === 500 ? "something went wrong" : (error.message ?? "something went wrong");

  return res.status(status).json({ message, error_stack: NODE_ENV === "development" ? error.stack : undefined, error });
};

export default errorHandler;
