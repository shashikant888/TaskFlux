import Constants from "../config/constants.js";
import redisClient from "../config/redis.js";
import { objectToStringObj } from "./helper.utils.js";

const REDIS_KEY = Constants.redis && Constants.redis.project ? Constants.redis.project : 'TASKFLUX:';

class RedisUtils {
    constructor() {
        this.redisClient = redisClient;
    }

    async setRedisDataAsync(key, data, expiry = 60 * 60) { // 1 hr expiration
        this.redisClient.set(REDIS_KEY + key, data);
        if (expiry) {
            this.redisClient.expire(REDIS_KEY + key, expiry);
        }
    }

    async getRedisDataAsync(key) {
        return this.redisClient.get(REDIS_KEY + key);
    }

    async getHMGetALLRedis(key) {
        return this.redisClient.hGetAll(REDIS_KEY + key);
    }

    async hmGetRedis(key, id) {
        return this.redisClient.hGet(REDIS_KEY + key, Array.isArray(id) ? id.join(',') : id.toString());
    }

    async hmGetRedisArray(key, ids) {
        return await this.redisClient.sendCommand(['HMGET', REDIS_KEY + key, ...(ids.map(id => id.toString()))]);
    }

    async setHMSetRedis(key, data, expiry = 60 * 60) {
        this.redisClient.hSet(REDIS_KEY + key, objectToStringObj(data));
        if (expiry) {
            this.redisClient.expire(REDIS_KEY + key, expiry);
        }
    }

    async setHMSetSingleRedis(key, id, data) {
        this.redisClient.hSet(REDIS_KEY + key, id, data);
    }

    async deleteRedisKeyPattern(key) {
        const tempData = await this.redisClient.keys('*' + REDIS_KEY + key + '*');
        tempData.forEach((val) => {
            this.redisClient.del(val);
        });
    }

    async deleteRedisKey(key) {
        this.redisClient.del(REDIS_KEY + key);
    }

    async deleteHMRedisKey(key, id) {
        this.redisClient.hDel(REDIS_KEY + key, id.toString());
    }

    coldStart() {
        const keys = [];
        keys.forEach((key) => {
            this.deleteRedisKey(key);
        });
        Object.keys(Constants.REDIS_KEY).forEach((key) => {
            const value = Constants.REDIS_KEY[key];
            if ([Constants.REDIS_KEY.USER_AUTH].indexOf(value) < 0) {
                this.deleteRedisKeyPattern(value);
            }
        });
    }
}

export default new RedisUtils();
