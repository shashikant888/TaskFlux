import httpStatus from "http-status";
import catchAsync from "../../lib/catchAsync.js";
import ResUtils from "../../lib/ResUtils.js";
import resConv from "../../middleware/resConv.js";
import UserService from "./user.service.js";

class UserController {
  getMe = catchAsync(async (req, res) => {
    const profile = await UserService.getById(req.user.id);
    ResUtils.status(httpStatus.OK).send(res, resConv(profile));
  });

  getById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const profile = await UserService.getById(id);
    ResUtils.status(httpStatus.OK).send(res, resConv(profile));
  });

  list = catchAsync(async (req, res) => {
    const users = await UserService.list({ role: req.query.role });
    ResUtils.status(httpStatus.OK).send(res, resConv(users));
  });
}

export default new UserController();

