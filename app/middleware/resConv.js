const DEFAULT_MESSAGE = "Success";

const resConv = (data = null, overrides = {}) => {
  if (data && typeof data === "object" && "response_code" in data) {
    return data;
  }

  const { response_code = 1, response_message = DEFAULT_MESSAGE } = overrides;

  return {
    response_code,
    response_message,
    response_obj: data ?? {},
  };
};

export default resConv;

