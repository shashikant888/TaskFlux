import httpStatus from "http-status";
import { Op } from "sequelize";
import ApiError from "../../middleware/ApiError.js";
import TaskModel from "./task.model.js";
import UserService from "../user/user.service.js";
import Constants from "../../config/constants.js";
import RedisUtils from "../../lib/redis.utils.js";
import Logger from "../../lib/logger.js";

class TaskService {
  listCacheKey(payload) {
    const serialized = JSON.stringify(payload);
    return (
      Constants.REDIS_KEY.TASK_LIST +
      Buffer.from(serialized).toString("base64")
    );
  }

  async purgeListCache() {
    if (Constants.IS_REDIS_STORE) {
      await RedisUtils.deleteRedisKeyPattern(Constants.REDIS_KEY.TASK_LIST);
    }
  }

  async createTask({ title, description, assignedToId, createdById }) {
    Logger.log("createTask: ", {title, description, assignedToId, createdById})
    const creator = await UserService.ensureEmployee(createdById);
    const assignee = await UserService.ensureEmployee(assignedToId);

    if (!assignee.managerId) {
      throw new ApiError(httpStatus.OK, "Assigned employee does not have a manager");
    }

    const task = await TaskModel.create({
      title,
      description,
      createdById: creator.id,
      assignedToId: assignee.id,
      status: Constants.taskStatus.PENDING_APPROVAL,
    });

    await this.purgeListCache();
    Logger.info("Task created", {
      taskId: task.id,
      createdById: creator.id,
      assignedToId: assignee.id,
    });

    return this.getTaskById(task.id);
  }

  async tasksList({ requester, filters }) {
    const { page = 1, limit = Constants.DEFAULT_LIST_LENGTH } = filters;
    const whereConditions = [];

    if (filters.status) {
      whereConditions.push({ status: filters.status });
    }

    if (filters.createdBy) {
      whereConditions.push({ createdById: filters.createdBy });
    }

    if (filters.assignedTo) {
      whereConditions.push({ assignedToId: filters.assignedTo });
    }

    if (requester.role === Constants.roles.EMPLOYEE) {
      whereConditions.push({
        [Op.or]: [
          { createdById: requester.id },
          { assignedToId: requester.id },
        ],
      });
    }

    const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const pagination = {
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    };

    const cacheKeyPayload = {
      requesterId: requester.id,
      requesterRole: requester.role,
      status: filters.status || null,
      createdBy: filters.createdBy || null,
      assignedTo: filters.assignedTo || null,
      page: Number(page),
      limit: Number(limit),
    };

    const cacheKey = this.listCacheKey({
      ...cacheKeyPayload,
    });

    if (Constants.IS_REDIS_STORE && !filters.disableCache) {
      const cached = await RedisUtils.getRedisDataAsync(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const { count, rows } = await TaskModel.findAndCountAll({
      where: whereClause,
      ...pagination,
      include: [
        {
          association: "createdBy",
          attributes: ["id", "name", "email"],
        },
        {
          association: "assignedTo",
          attributes: ["id", "name", "email", "managerId"],
        },
        {
          association: "approvedBy",
          attributes: ["id", "name", "email"],
        },
        {
          association: "rejectedBy",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const response = {
      data: rows.map((row) => row.toJSON()),
      meta: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)) || 1,
      },
    };

    if (Constants.IS_REDIS_STORE && !filters.disableCache) {
      await RedisUtils.setRedisDataAsync(cacheKey, JSON.stringify(response), 60);
    }

    return response;
  }

  async getTaskById(taskId) {
    const task = await TaskModel.findByPk(taskId, {
      include: [
        { association: "createdBy", attributes: ["id", "name", "email"] },
        {
          association: "assignedTo",
          attributes: ["id", "name", "email", "managerId"],
        },
        { association: "approvedBy", attributes: ["id", "name", "email"] },
        { association: "rejectedBy", attributes: ["id", "name", "email"] },
      ],
    });

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    return task.toJSON();
  }

  async approveRejectTask({ taskId, managerId, isApproved = true }) {
    const task = await this.getTaskAggregate(taskId);

    if (!task.assignedTo?.managerId) {
      throw new ApiError(httpStatus.OK, "Assigned employee does not have a manager");
    }

    if (task.status !== Constants.taskStatus.PENDING_APPROVAL) {
      throw new ApiError(httpStatus.OK, "Only pending tasks can be approved/rejected");
    }

    if (task.assignedTo.managerId !== managerId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Only assigned employee's manager can approve/reject");
    }

    await TaskModel.update(
      {
        status: isApproved ? Constants.taskStatus.APPROVED : Constants.taskStatus.REJECTED,
        approvedById: isApproved ? managerId : null,
        approvedAt: isApproved ? new Date() : null,
        rejectedById: !isApproved ? managerId : null,
        rejectedAt: !isApproved ? new Date() : null,
      },
      { where: { id: taskId } }
    );

    await this.purgeListCache();
    Logger.info("Task approved/rejected", { taskId, managerId, isApproved });
    return this.getTaskById(taskId);
  }

  async startTask({ taskId, employeeId }) {
    const task = await this.getTaskAggregate(taskId);
    if (task.assignedTo.id !== employeeId) {
      throw new ApiError(httpStatus.OK, "Only the assigned employee can start the task");
    }

    if (task.status !== Constants.taskStatus.APPROVED) {
      throw new ApiError(httpStatus.OK, "Task must be approved before starting work");
    }

    await TaskModel.update(
      {
        status: Constants.taskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      { where: { id: taskId } }
    );

    await this.purgeListCache();
    Logger.info("Task started", { taskId, employeeId });
    return this.getTaskById(taskId);
  }

  async closeTask({ taskId, employeeId }) {
    const task = await this.getTaskAggregate(taskId);
    if (task.assignedTo.id !== employeeId) {
      throw new ApiError(httpStatus.OK, "Only the assigned employee can close the Task");
    }

    if (task.status !== Constants.taskStatus.IN_PROGRESS) {
      throw new ApiError(httpStatus.OK, "Task must be in progress to close");
    }

    await TaskModel.update(
      {
        status: Constants.taskStatus.CLOSED,
        closedAt: new Date(),
      },
      { where: { id: taskId } }
    );

    await this.purgeListCache();
    Logger.info("Taks closed", { taskId, employeeId });
    return this.getTaskById(taskId);
  }

  async getTaskAggregate(taskId) {
    const task = await TaskModel.findByPk(taskId, {
      include: [
        { association: "assignedTo", attributes: ["id", "managerId"] },
        { association: "createdBy", attributes: ["id"] },
      ],
    });

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    const response = task.toJSON();

    if (!response.assignedTo) {
      throw new ApiError(httpStatus.OK, "Assigned employee record not found");
    }

    return response;
  }
}

export default new TaskService();

