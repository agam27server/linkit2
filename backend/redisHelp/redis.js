import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: "naGNopcgJR0wWYcsozDprGpFABSqMSGg",
  socket: {
    host: "redis-16551.crce217.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 16551,
  },
});

redis.on("error", (err) => console.log("Redis Client Error:", err));

await redis.connect();
console.log("Connected to Redis");

export default redis;
