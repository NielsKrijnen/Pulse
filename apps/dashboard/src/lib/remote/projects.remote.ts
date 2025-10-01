import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";

type Project = {
  id: string
  name: string
  repoUrl: string
  createdAt: string
  userId: string
  buildCommand: string
}

export const list = query(async () => {
  const { fetch } = getRequestEvent()

  const response = await fetch("http://api:3000/projects")

  if (response.ok) {
    return await response.json() as Project[]
  } else {
    error(response.status, response.statusText)
  }
})

export const get = query(z.uuid(), async id => {
  const { fetch } = getRequestEvent()

  const response = await fetch(`http://api:3000/projects/${id}`)

  if (response.ok) {
    return await response.json() as Project
  } else {
    error(response.status, response.statusText)
  }
})