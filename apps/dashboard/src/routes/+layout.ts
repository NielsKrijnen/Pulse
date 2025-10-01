import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
  return {
    breadcrumbs: [
      {
        href: "/",
        label: "Dashboard"
      }
    ]
  }
}