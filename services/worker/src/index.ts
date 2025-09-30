import { Worker } from "bullmq";
import type { Deployment } from "../../api/src"
import { reportStatus } from "./api";
import { deploy } from "./deployments";

const worker = new Worker<Deployment>("deployments", deploy, {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  },
  concurrency: 1
})

worker.on("failed", async (job, error) => {
  console.log(`Job ${job?.id} failed: ${error.message}`)
  if (job) {
    await reportStatus(job.data.id, "failed")
  }
})