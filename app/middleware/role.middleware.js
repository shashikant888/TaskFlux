import httpStatus from "http-status";
import ApiError from "./ApiError.js";

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(httpStatus.FORBIDDEN, "You are not allowed to perform this action")
      );
    }
    return next();
  };
};

export default roleMiddleware;

