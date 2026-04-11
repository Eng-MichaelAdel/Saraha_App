import { ForbiddenException } from "../common/utils/index.js";

export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.userData.role;
    if (!roles.includes(userRole)) {
      throw new ForbiddenException("you are not authorized to access these route");
      ;
    }

    next();
  };
};
