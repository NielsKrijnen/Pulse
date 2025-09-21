import { Worker } from "bullmq";
import type { Deployment } from "../../api/src"
import Docker from "dockerode"
import fs from "fs-extra"
import tar from "tar-fs"
import simpleGit from "simple-git"
import path from "path"

const docker = new Docker({ socketPath: "/var/run/docker.sock" })
const jobsPath = "/tmp/jobs" as const

async function main() {
  await fs.ensureDir(jobsPath)

  const worker = new Worker<Deployment>("deployments", async job => {
    console.log(job.data)
    const repository = job.data.repository.split("/").pop()?.replace(".git", "")?.toLowerCase() || "repo"
    console.log(repository)

    const containerName = `${repository}-${job.data.branch}`
    const imageTag = `${repository}:${job.data.branch}`
    const host = `${repository}.localhost`

    const builder = await docker.createContainer({
      Image: "docker:24-dind",
      Cmd: [

      ]
    })

    const container = await docker.createContainer({
      Image: imageTag,
      name: containerName,
      Labels: {
        "traefik.enable": "true",
        [`traefik.http.routers.${containerName}.rule`]: `Host(\`${host}\`)`,
        [`traefik.http.routers.${containerName}.entrypoints`]: "web"
      }
    })

    await container.start()
  }, {
    connection: {
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
    },
    concurrency: 1
  })

  worker.on("failed", (job, error) => {
    console.log(`Job ${job?.id} failed: ${error.message}`)
  })
}

main().catch(console.error)