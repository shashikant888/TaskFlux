import httpStatus from "http-status";
import catchAsync from "../../lib/catchAsync.js";
import ResUtils from "../../lib/ResUtils.js";
import resConv from "../../middleware/resConv.js";
import AuthService from "./auth.service.js";

class AuthController {
  signup = catchAsync(async (req, res) => {
    const user = await AuthService.signup(req.body);
    ResUtils.status(httpStatus.CREATED).send(res, resConv(user));
  });

  login = catchAsync(async (req, res) => {
    const response = await AuthService.login(req.body);
    ResUtils.status(httpStatus.OK).send(res, resConv(response));
  });
  
  logout = catchAsync(async (req, res) => {
    const userId = req.user.id;
    await AuthService.pugeCache(userId);
    ResUtils.status(httpStatus.OK).send(res, resConv());
  });
}

export default new AuthController();

