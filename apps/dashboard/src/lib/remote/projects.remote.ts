import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";

export const list = query(async () => {
  const { fetch } = getRequestEvent()

  const response = await fetch("http://api:3000/projects")

  if (response.ok) {
    return await response.json() as { id: string, name: string, repoUrl: string }[]
  } else {
    error(response.status, response.statusText)
  }
})