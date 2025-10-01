import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";

export const list = query(z.object({
  project: z.uuid().optional()
}).optional(), async data => {
  const { fetch } = getRequestEvent()

  const url = new URL("http://api:3000/deployments")
  if (data?.project) url.searchParams.append("project", data.project)

  const response = await fetch(url)

  if (response.ok) {
    return await response.json() as {
      id: string
      projectId: string
      status: "queued" | "building" | "success" | "failed"
      commitHash: string | null
      log: string | null
      createdAt: string
      finishedAt: string | null
    }[]
  } else {
    error(response.status, response.statusText)
  }
})