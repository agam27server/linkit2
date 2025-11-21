import { createClient } from "redis";

let redis = null;

if (process.env.REDIS_URL) {
  redis = createClient({
    url: process.env.REDIS_URL
  });

  redis.on("error", (err) => console.log("Redis Client Error:", err));

  // Connect without top-level await to prevent blocking/crashing
  redis.connect().then(() => {
    console.log("Connected to Redis");
  }).catch((err) => {
    console.log("Failed to connect to Redis:", err);
  });
} else {
  console.log("REDIS_URL not found, skipping Redis connection");
}

export default redis;
