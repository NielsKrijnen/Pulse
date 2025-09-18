import { PrismaClient } from "@prisma/client";
import express from "express"

const prisma = new PrismaClient()
const app = express()

app.get("/users", async (_, res) => {
  const users = await prisma.user.findMany({
    omit: {
      password: true
    }
  })

  res.json(users)
})

app.get("/users/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id
      }
    })

    if (!user) {
      return res.status(404)
    }

    return res.json(user)
  } catch (error) {
    console.error(error)
    return res.status(500)
  }
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})