import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";

export const list = query(async () => {
  const { fetch } = getRequestEvent()

  const response = await fetch("http://api:3000/deployments")

  if (response.ok) {
    return await response.json() as {
      id: string
      status: "queued" | "building" | "success" | "failed"
      finishedAt: string | null
    }[]
  } else {
    error(response.status, response.statusText)
  }
})