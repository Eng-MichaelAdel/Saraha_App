import { ForbiddenException } from "../common/index.js";

export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      throw new ForbiddenException("you are not authorized to access these route");
      ;
    }

    next();
  };
};
