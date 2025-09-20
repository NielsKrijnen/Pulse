import { PrismaClient } from "@prisma/client";
import express from "express"

const prisma = new PrismaClient()
const app = express()

app.get("/users", async (_, res) => {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true
      }
    })

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
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

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})