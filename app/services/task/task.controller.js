import httpStatus from "http-status";
import catchAsync from "../../lib/catchAsync.js";
import ResUtils from "../../lib/ResUtils.js";
import resConv from "../../middleware/resConv.js";
import TaskService from "./task.service.js";

class TaskController {
  create = catchAsync(async (req, res) => {
    const { title, description, assignedToId } = req.body;
    const userId = req.user.id;
    const response = await TaskService.createTask({
      title,
      description,
      assignedToId,
      createdById: userId,
    });
    ResUtils.status(httpStatus.CREATED).send(res, resConv(response));
  });

  list = catchAsync(async (req, res) => {
    const { status, createdBy, assignedTo, page, limit } = req.query;
    const response = await TaskService.tasksList({
      requester: req.user,
      filters: {
        status,
        createdBy,
        assignedTo,
        page,
        limit,
      },
    });
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });

  getById = catchAsync(async (req, res) => {
    const response = await TaskService.getTaskById(req.params.id);
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });

  approve = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const response = await TaskService.approveRejectTask({
      taskId: id,
      managerId: userId,
      isApproved: true
    })
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });

  reject = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const response = await TaskService.approveRejectTask({
      taskId: id,
      managerId: userId,
      isApproved: false
    })
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });

  start = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const response = await TaskService.startTask({
      taskId: id,
      employeeId: userId,
    });
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });

  close = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const response = await TaskService.closeTask({
      taskId: id,
      employeeId: userId,
    });
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });
}

export default new TaskController();

