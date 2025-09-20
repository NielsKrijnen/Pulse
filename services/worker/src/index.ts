import { Worker } from "bullmq";

const worker = new Worker("deployments", async job => {
  console.log(job)
}, {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  }
})

worker.on("completed", job => {
  console.log(`Job ${job.id} completed`)
})

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed: ${error.message}`)
})