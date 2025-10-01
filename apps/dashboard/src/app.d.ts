import type { Breadcrumb } from "$lib/types";

declare global {
	namespace App {
		interface PageData {
			breadcrumbs: Breadcrumb[]
		}
	}
}