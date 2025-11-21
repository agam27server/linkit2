import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../redisHelp/redis.js";

export const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 attempts
  standardHeaders: true,
  legacyHeaders: false,

  store: redis ? new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }) : undefined,

  handler: (req, res, next) => {
    res.status(429).render("429", {
      isDarkMode: false,
      user: req.user || null
    });
  }
});
