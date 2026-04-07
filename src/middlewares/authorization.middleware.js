import { errorResponse } from "../common/utils/index.js";

export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.userData.role;
    if (!roles.includes(userRole)) {
      errorResponse({ message: "you are not authorized to access these route", status: 403 });
    }

    next();
  };
};
