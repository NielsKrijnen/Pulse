import { Job } from "bullmq";
import { Deployment } from "../../api/src";
import Docker from "dockerode";
import { reportStatus } from "./api";

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

export async function deploy(job: Job<Deployment>) {
  const repository = job.data.repository.split("/").pop()?.replace(".git", "")?.toLowerCase() || "repo"

  const imageTag = `${repository}:${job.data.branch}`

  await reportStatus(job.data.id, "building")

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

  await reportStatus(job.data.id, "success")
}