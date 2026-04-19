import { BadRequestException } from "../common/index.js";

const validation = (schema) => {
  return (req, res, next) => {
    let validationErrors = [];

    for (const key in schema) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        validationErrors.push({
          key,
          validationErrors: error.details.map(({ message, path }) => {
            return { path: path[0], message };
          }),
        });
      }
    }

    if (validationErrors.length) {
      throw new BadRequestException("Validation Error", validationErrors);
    }

    next();
  };
};

export default validation;
