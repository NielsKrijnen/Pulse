<script lang="ts">
	import '../app.css';
	// noinspection ES6UnusedImports
	import { Sidebar, Separator, Breadcrumb } from "$lib/components/ui"
	import { SquareActivity } from "@lucide/svelte";
	import type { Component } from "svelte";
	import type { Pathname } from "$app/types";
	import { page } from "$app/state";

	let { children } = $props();

	const sidebarSettings = {
		items: {
			app: [
				{
					name: "Dashboard",
					href: "/"
				},
				{
					name: "Projects",
					href: "/projects"
				},
				{
					name: "Deployments",
					href: "/deployments"
				},
				{
					name: "Domains",
					href: "/domains"
				},
				{
					name: "Users",
					href: "/users"
				}
			]
		}
	} as const satisfies {
		items: {
			app: {
				name: string
				href: Pathname
				icon?: Component
			}[]
		}
	}
</script>

<Sidebar.Provider>
	<Sidebar.Root>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem class="flex items-center gap-2 p-0.5">
					<SquareActivity/>
					<h2 class="text-xl font-medium">Pulse</h2>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>App</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each sidebarSettings.items.app as item}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={item.href === page.url.pathname}>
									{#snippet child({ props })}
										<a {...props} href={item.href}>
											<span>{item.name}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b">
			<div class="flex items-center gap-2 px-3">
				<Sidebar.Trigger/>
				<Separator orientation="vertical" class="mr-2 h-4"/>
				<Breadcrumb.Root>
					<Breadcrumb.List>
						{#each page.data.breadcrumbs as breadcrumb, i}
							{#if breadcrumb.href === page.url.pathname}
								<Breadcrumb.Item>
									<Breadcrumb.Page>{breadcrumb.label}</Breadcrumb.Page>
								</Breadcrumb.Item>
							{:else}
								<Breadcrumb.Item>
									<Breadcrumb.Link href={breadcrumb.href}>{breadcrumb.label}</Breadcrumb.Link>
								</Breadcrumb.Item>
								{#if i < page.data.breadcrumbs.length - 1}
									<Breadcrumb.Separator/>
								{/if}
							{/if}
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="p-4 overflow-y-auto">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>