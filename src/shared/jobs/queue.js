import { Queue } from "bullmq";
import redis from "@/shared/lib/redis";

export const imageQueue = new Queue("image-processing", {
  connection: redis,
});

export const emailQueue = new Queue("email-processing", {
  connection: redis,
});
