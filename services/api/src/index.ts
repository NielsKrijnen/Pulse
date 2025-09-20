import { PrismaClient } from "@prisma/client";
import express, { Request, Response, NextFunction } from "express"
import { z } from "zod";
import * as argon from "argon2"

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