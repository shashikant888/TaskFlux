import httpStatus from "http-status";
import ApiError from "../../middleware/ApiError.js";
import UserModel from "../user/user.model.js";
import Constants from "../../config/constants.js";
import JwtUtils from "../../lib/jwt.utils.js";
import RedisUtils from "../../lib/redis.utils.js";
import Logger from "../../lib/logger.js";

class AuthService {
  async signup(payload) {
    const { name, email, password, role, managerId } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    if (!Object.values(Constants.roles).includes(role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role supplied");
    }

    if (role === Constants.roles.EMPLOYEE && !managerId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "managerId is required for employees");
    }

    const existing = await UserModel.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "User already exists");
    }

    let managerRecord = null;
    if (managerId) {
      managerRecord = await UserModel.findByPk(managerId);
      if (!managerRecord) {
        throw new ApiError(httpStatus.NOT_FOUND, "Manager not found");
      }
      if (managerRecord.role !== Constants.roles.MANAGER) {
        throw new ApiError(httpStatus.FORBIDDEN, "Assigned manager must have manager role");
      }
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      managerId: managerRecord ? managerRecord.id : null,
    });

    await this.pugeCache(user.id);
    Logger.info(`User ${user.id} registered`, { role: user.role });

    return user.toJSON();
  }

  async login(payload) {
    const { email, password } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.scope("withPassword").findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User Not Found!");
    }

    const isValidPassword = await user.authenticate(password);
    if (!isValidPassword) {
      Logger.warn("Invalid password attempt", { email: normalizedEmail });
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const token = JwtUtils.sign({
      id: user.id,
      role: user.role,
    });

    const userData = user.toJSON();
    if (Constants.IS_REDIS_STORE) {
      await RedisUtils.setRedisDataAsync(
        `${Constants.REDIS_KEY.USER_AUTH}${user.id}`,
        JSON.stringify({ ...userData, token }),
        60 * 60 * 24
      );
    }

    Logger.info(`User ${user.id} logged in`, { email: normalizedEmail });
    return { token, user: userData };
  }

  async pugeCache(userId) {
    if (!userId) return;
    await RedisUtils.deleteRedisKey(`${Constants.REDIS_KEY.USER_AUTH}${userId}`);
  }
}

export default new AuthService();

