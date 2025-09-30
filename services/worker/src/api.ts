export async function reportStatus(id: string, status: "building" | "success" | "failed") {
  await fetch(`http://api:3000/deployments/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
}