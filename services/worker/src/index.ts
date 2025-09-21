import { Worker } from "bullmq";
import type { Deployment } from "../../api/src"
import { exec } from "node:child_process";

function run(cmd: string) {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(new Error(stderr || error.message))
      console.log(stdout, stderr)
      resolve()
    })
  })
}

const worker = new Worker<Deployment>("deployments", async job => {
  console.log(job.data)
  await run(`
    docker run --rm \
      -v /var/run/docker.sock:/var/run/docker.sock \
      docker:24-dind \
      sh -c "
        git clone --branch ${job.data.branch} --single-branch ${job.data.repository} repo &&
        cd repo &&
        docker build -t pulse/${job.name}:latest .
      "
  `)
}, {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  }
})

worker.on("ready", () => console.log("Worker is ready"))

worker.on("completed", job => {
  console.log(`Job ${job.id} completed`)
})

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed: ${error.message}`)
})