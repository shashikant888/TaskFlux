import jwt from "jsonwebtoken";
import Constants from "../config/constants.js";

class JwtUtils {
  sign(payload, options = {}) {
    return jwt.sign(payload, Constants.security.session_secret, {
      expiresIn: Constants.security.session_expire_in,
      ...options,
    });
  }

  verify(token) {
    return jwt.verify(token, Constants.security.session_secret);
  }

  decode(token) {
    return jwt.decode(token);
  }
}

export default new JwtUtils();

