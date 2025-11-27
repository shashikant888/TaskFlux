class ResUtils {
  constructor() {
    this.statusCode = 200;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  send(res, payload = {}) {
    if (!res || typeof res.status !== "function") {
      return payload;
    }
    return res.status(this.statusCode).json(payload);
  }
}

export default new ResUtils();

