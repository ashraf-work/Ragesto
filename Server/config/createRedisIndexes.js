import redisClient from "./redis.js";

const createRedisIndexes = async () => {
  try {
    // Check if index already exists
    try {
      await redisClient.ft.info("userIdIdx");
      console.log("Redis index 'userIdIdx' already exists");
      return;
    } catch {
      // Index doesn't exist, create it
    }

    await redisClient.ft.create(
      "userIdIdx",
      {
        "$.userId": {
          type: "TAG",
          AS: "userId",
        },
      },
      {
        ON: "JSON",
        PREFIX: ["session:"], // ✅ FIX
      }
    );

    console.log("Redis index 'userIdIdx' created successfully");
  } catch (err) {
    console.error("Failed to create Redis index:", err.message);
  }
};

await createRedisIndexes();

await redisClient.quit();