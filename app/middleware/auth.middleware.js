import httpStatus from "http-status";
import ApiError from "./ApiError.js";
import JwtUtils from "../lib/jwt.utils.js";
import UserModel from "../services/user/user.model.js";
import RedisUtils from "../lib/redis.utils.js";
import Constants from "../config/constants.js";

const getToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

const buildCacheKey = (userId) => `${Constants.REDIS_KEY.USER_AUTH}${userId.toString()}`;

const AuthMiddleware = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not found");
    }

    const decoded = JwtUtils.verify(token);
    const userId = decoded?.id || decoded?._id;
    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    let userProfile = null;
    const cacheKey = buildCacheKey(userId);
    if (Constants.IS_REDIS_STORE) {
      const cachedUser = await RedisUtils.getRedisDataAsync(cacheKey);
      if (cachedUser) {
        userProfile = JSON.parse(cachedUser);
      }
    }

    if (!userProfile) {
      const userInstance = await UserModel.findByPk(userId, {
        raw: true,
      });
      userProfile = userInstance;
      if (!userProfile) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
      }
      if (userProfile?.password) {
        delete userProfile.password;
      }
      if (Constants.IS_REDIS_STORE) {
        await RedisUtils.setRedisDataAsync(cacheKey, JSON.stringify(userProfile));
      }
    }

    req.user = {
      ...userProfile,
      token,
    };
    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(httpStatus.UNAUTHORIZED, error.message)
    );
  }
};

export default AuthMiddleware;

