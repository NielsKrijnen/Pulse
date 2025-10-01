import { PrismaClient } from "@prisma/client";
import express, { Request, Response, NextFunction } from "express"
import { z } from "zod";
import * as argon from "argon2"
import { Queue } from "bullmq";

const deployments = new Queue("deployments", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  }
})

const prisma = new PrismaClient()
const app = express()

app.use(express.json())

app.get("/users", async (_, res) => {
  const users = await prisma.user.findMany()

  res.json(users)
})

app.post("/users", async (req, res) => {
  const data = z.object({
    email: z.email(),
    password: z.string().min(8)
  }).parse(req.body)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: await argon.hash(data.password)
    }
  })

  res.json(user)
})

app.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!user) res.status(404).send()

  res.json(user)
})

app.delete("/users/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id }
  }).catch(() => res.status(404).send())

  res.status(204).send()
})

app.patch("/users/:id", async (req, res) => {
  const data = z.object({
    email: z.email().optional(),
    password: z.string().min(8).optional()
  }).parse(req.body)

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      email: data.email,
      password: data.password ? await argon.hash(data.password) : undefined
    }
  }).catch(() => res.status(404).send())

  res.json(user)
})

const DeploymentSchema = z.object({
  type: z.enum(["github"]),
  repository: z.string(),
  branch: z.string(),
  id: z.string()
})

export type Deployment = z.infer<typeof DeploymentSchema>

const ProjectSchema = z.object({
  user: z.uuid(),
  name: z.string(),
  repoUrl: z.url()
})

app.get("/projects", async (_, res) => {
  const projects = await prisma.project.findMany()

  res.json(projects)
})

app.post("/projects", async (req, res) => {
  const data = ProjectSchema.parse(req.body)

  const project = await prisma.project.create({
    data: {
      userId: data.user,
      name: data.name,
      repoUrl: data.repoUrl
    }
  })

  res.json(project)
})

app.get("/projects/:id", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id }
  })
  if (!project) return res.status(404).send()

  res.json(project)
})

app.post("/projects/:id/deploy", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id }
  })
  if (!project) return res.status(404).send()

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "queued"
    }
  })
  await deployments.add(`${project.name}-${deployment.id}`, {
    type: "github",
    repository: project.repoUrl,
    branch: "main",
    id: deployment.id
  })

  res.json(deployment)
})

app.get("/deployments", async (req, res) => {
  const data = z.object({
    project: z.uuid().optional()
  }).optional().parse(req.query)

  const deployments = await prisma.deployment.findMany({
    where: {
      projectId: data?.project
    }
  })

  res.json(deployments)
})

app.get("/deployments/:id", async (req, res) => {
  const deployment = await prisma.deployment.findUnique({
    where: { id: req.params.id }
  })
  if (!deployment) return res.status(404).send()

  res.json(deployment)
})

app.post("/deployments/:id/status", async (req, res) => {
  const data = z.object({
    status: z.enum(["queued", "building", "success", "failed"])
  }).parse(req.body)

  await prisma.deployment.update({
    data: {
      status: data.status,
      finishedAt: data.status === "success" ? new Date() : null
    },
    where: { id: req.params.id }
  })

  res.status(204).send()
})

app.use((err: unknown, _: Request, res: Response, __: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: "Invalid request",
      issues: err.issues
    })
  }
  console.error(err)
  res.status(500).send()
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})