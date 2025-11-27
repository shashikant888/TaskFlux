import dotenv from "dotenv";
dotenv.config({ quiet: true });

const ENV = process.env.NODE_ENV;

const defaultConfig = {
  apiPrefix: "/api",
  adminPrefix: "/admin",
  TIME_ZONE: Number(process.env.TIME_ZONE) || 5.5,
  LOGGER_ENABLED: process.env.LOGGER_ENABLED === "true",
  LOG_ENABLED: process.env.LOG_ENABLED === "true",
  IS_REDIS_STORE: process.env.IS_REDIS_STORE !== "false",
  DEFAULT_LIST_LENGTH: Number(process.env.DEFAULT_LIST_LENGTH) || 20,
  DEFAULT_USER_IMAGE: process.env.DEFAULT_USER_IMAGE || "logo/logo.png",
  DEFAULT_RETIRING_AGE: Number(process.env.DEFAULT_RETIRING_AGE) || 60,
};

const allConfig = {
  development: {
    public_url: process.env.URL,

    security: {
      session_secret: process.env.SESSION_SECRET || "T8h/Czg4CbYK9x48G3qzH+gi8o4nR9kyReaKuqyNfvo=",
      session_expire_in: Number(process.env.SESSION_EXPIRE_IN) || process.env.SESSION_EXPIRE_IN || "7d", // 7 day
      salt_rounds: process.env.SALT_ROUNDS || 12,
    },

    postgres: {
      host: process.env.POSTGRES_HOST_DEV,
      port: Number(process.env.POSTGRES_PORT_DEV) || 5432,
      database: process.env.POSTGRES_DB_DEV,
      username: process.env.POSTGRES_USER_DEV,
      password: process.env.POSTGRES_PASSWORD_DEV,
      ssl: process.env.POSTGRES_SSL_DEV === "true",
      logging: process.env.POSTGRES_LOGGING_DEV === "true",
      pool: {
        max: Number(process.env.POSTGRES_POOL_MAX_DEV) || 10,
        min: Number(process.env.POSTGRES_POOL_MIN_DEV) || 1,
      },
    },
    server: {
      port: process.env.PORT || 3000,
    },
    redis: {
      uri: process.env.REDIS_URI_DEV,
      project: process.env.REDIS_PROJECT,
    },
    logging: {
      level: process.env.LOG_LEVEL || "debug",
    },
  },

  production: {
    public_url: process.env.URL,

    security: {
      session_secret: process.env.SESSION_SECRET,
    },

    postgres: {
      host: process.env.POSTGRES_HOST_PROD,
      port:Number(process.env.POSTGRES_PORT_PROD) || 5432,
      database: process.env.POSTGRES_DB_PROD,
      username: process.env.POSTGRES_USER_PROD,
      password: process.env.POSTGRES_PASSWORD_PROD,
      ssl: process.env.POSTGRES_SSL_PROD === "true",
      logging: process.env.POSTGRES_LOGGING_PROD === "true",
      pool: {
        max: Number(process.env.POSTGRES_POOL_MAX_PROD) || 20,
        min: Number(process.env.POSTGRES_POOL_MIN_PROD) || 5,
      },
    },
    server: {
      port: process.env.PORT || 3000,
    },
    redis: {
      uri: process.env.REDIS_URI_PROD,
      project: process.env.REDIS_PROJECT,
    },
    logging: {
      level: process.env.LOG_LEVEL || "info",
    },
  },

  test: {
    public_url: process.env.URL,

    security: {
      session_secret: process.env.SESSION_SECRET,
    },

    postgres: {
      host: process.env.POSTGRES_HOST_TEST,
      port: Number(process.env.POSTGRES_PORT_TEST) || 5432,
      database: process.env.POSTGRES_DB_TEST,
      username: process.env.POSTGRES_USER_TEST,
      password: process.env.POSTGRES_PASSWORD_TEST,
      ssl: process.env.POSTGRES_SSL_TEST === "true",
      logging: process.env.POSTGRES_LOGGING_TEST === "true",
      pool: {
        max: Number(process.env.POSTGRES_POOL_MAX_TEST) || 5,
        min: Number(process.env.POSTGRES_POOL_MIN_TEST) || 0,
      },
    },
    server: {
      port: 4000,
    },
    redis: {
      uri: process.env.REDIS_URI_TEST,
      project: process.env.REDIS_PROJECT,
    },
    logging: {
      level: process.env.LOG_LEVEL || "warn",
    },
  },
};

const roleConstants = Object.freeze({
  EMPLOYEE: "employee",
  MANAGER: "manager",
});

const TaskStatusConstants = Object.freeze({
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
});

const eventConstants = {
  REDIS_KEY: {
    USER_AUTH: "USER_AUTH:",
    USER_PROFILE: "USER_PROFILE:",
    TASK_LIST: "TASK_LIST:",
  },

  EVENTS: {
    USER_UPDATED: "USER_UPDATED",
    TASK_UPDATED: "TASK_UPDATED",
  },
};

const Constants = {
  env: ENV,
  ...defaultConfig,
  ...eventConstants,
  ...(allConfig[ENV] || allConfig.development),
};

Constants.security.session_expires_in = Constants.security.session_expire_in;
Constants.roles = roleConstants;
Constants.taskStatus = TaskStatusConstants;

export default Constants;
