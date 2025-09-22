import { Worker } from "bullmq";
import type { Deployment } from "../../api/src"
import Docker from "dockerode"

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

const worker = new Worker<Deployment>("deployments", async job => {
  console.log(job.data)
  const repository = job.data.repository.split("/").pop()?.replace(".git", "")?.toLowerCase() || "repo"
  console.log(repository)

  const containerName = `${repository}-${job.data.branch}`
  const imageTag = `${repository}:${job.data.branch}`
  const host = `${repository}.localhost`

  await new Promise<void>(async (resolve, reject) => {
    const stream = await docker.pull("docker:24-dind")
    docker.modem.followProgress(stream, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })

  await docker.pull("docker:24-dind")

  const builder = await docker.createContainer({
    Image: "docker:24-dind",
    Cmd: [
      "sh",
      "-c",
      `
      git clone --branch ${job.data.branch} --single-branch ${job.data.repository} repo &&
      cd repo &&
      docker build -t ${imageTag} .
      `,
    ],
    Volumes: {
      "/var/run/docker.sock": {}
    },
    HostConfig: {
      Binds: ["/var/run/docker.sock:/var/run/docker.sock"],
      AutoRemove: true
    },
    Tty: true
  })

  await builder.start()

  const stream = await builder.logs({
    follow: true,
    stdout: true,
    stderr: true
  })

  stream.on("data", chunk => process.stdout.write(chunk.toString()))

  await builder.wait()

  const container = await docker.createContainer({
    Image: imageTag,
    name: containerName,
    Labels: {
      "traefik.enable": "true",
      [`traefik.http.routers.${containerName}.rule`]: `Host(\`${host}\`)`,
      [`traefik.http.routers.${containerName}.entrypoints`]: "web"
    },
    HostConfig: {
      NetworkMode: "pulse_default"
    }
  })

  await container.start()

  console.log(`Running on http://${host}`)
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