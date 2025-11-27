import httpStatus from "http-status";
import UserModel from "./user.model.js";
import ApiError from "../../middleware/ApiError.js";
import Constants from "../../config/constants.js";
import RedisUtils from "../../lib/redis.utils.js";
import DateUtils from "../../lib/date.utils.js";
import Logger from "../../lib/logger.js";

class UserService {
  userCacheKey(userId) {
    return `${Constants.REDIS_KEY.USER_PROFILE}${userId}`;
  }

  async getById(userId, { useCache = true } = {}) {
    Logger.log("user - getById: ", userId, useCache);
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User id is required");
    }

    const cacheKey = this.userCacheKey(userId);
    if (useCache && Constants.IS_REDIS_STORE) {
      const cachedProfile = await RedisUtils.getRedisDataAsync(cacheKey);
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }
    }

    const user = await UserModel.findByPk(userId, { raw: true });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    user.createdAtText = DateUtils.changeTimezoneFromUtc(user.createdAt, Constants.TIME_ZONE, 'DD/MM/YYY hh:mm A');

    if (useCache && Constants.IS_REDIS_STORE) {
      await RedisUtils.setRedisDataAsync(cacheKey, JSON.stringify(user));
    }

    return user;
  }

  async list({ role } = {}) {
    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }

    const users = await UserModel.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return users.map((val) => {
      return {
        ...val,
        createdAtText: DateUtils.changeTimezoneFromUtc(val.createdAt, Constants.TIME_ZONE, 'DD/MM/YYY hh:mm A'),
      }
    });
  }

  async ensureManager(userId) {
    const user = await this.getById(userId);
    if (user.role !== Constants.roles.MANAGER) {
      throw new ApiError(httpStatus.FORBIDDEN, "Only managers can perform this action");
    }
    return user;
  }

  async ensureEmployee(userId) {
    const user = await this.getById(userId);
    if (user.role !== Constants.roles.EMPLOYEE) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Target user must be an employee");
    }
    return user;
  }

  async purgeCache(userId) {
    if (!userId) return;
    await RedisUtils.deleteRedisKey(this.userCacheKey(userId));
  }
}

export default new UserService();

