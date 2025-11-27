import { createClient } from "redis";
import Constants from "./constants.js";
import Logger from "../lib/logger.js";
import RedisUtils from '../lib/redis.utils.js'

const redisClient = createClient({
  url: Constants.redis.uri,
  legacyMode: false,
  socket: {
    connectTimeout: 30000,
    keepAlive: 5000,
    reconnectStrategy: (retries) => {
      Logger.warn(`Redis reconnect attempt: ${retries}`);
      if (retries > 10)
        return new Error("Redis connect, Too many retries, stopping.");
      return Math.min(retries * 5000, 10000);
    },
  },
});

Logger.warn("REDIS uri: ", Constants.redis.uri);

redisClient.on("error", (err) => {
  Logger.error("Redis redisClient Error", err);
});

redisClient.on("end", () => {
  Logger.warn("Redis connection closed. Attempting to reconnect...");
  setTimeout(() => redisClient.connect().catch(Logger.error), 5000);
});

redisClient
  .connect()
  .then(() => {
    Logger.info("Redis Connected");
    RedisUtils.coldStart();
  })
  .catch((err) => {
    Logger.error("Redis error", err);
  });

// Ensure Redis closes on app shutdown
process.on("SIGINT", async () => {
  Logger.warn("Closing Redis redisClient...");
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;
