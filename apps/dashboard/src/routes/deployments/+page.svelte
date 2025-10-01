<script lang="ts">
  // noinspection ES6UnusedImports
  import { Table, Badge } from "$lib/components/ui"
  import { CircleCheck, CircleX, Pickaxe, Loader } from "@lucide/svelte";
  import * as deployments from "$lib/remote/deployments.remote"
  import * as projects from "$lib/remote/projects.remote"
  import { onMount } from "svelte";

  onMount(() => {
    setInterval(async () => {
      await deployments.list({}).refresh()
    }, 1000)
  })
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>ID</Table.Head>
      <Table.Head>Project</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each await deployments.list({}) as deployment}
      {@const project = await projects.get(deployment.projectId)}
      <Table.Row>
        <Table.Cell>{deployment.id}</Table.Cell>
        <Table.Cell>
          <a href="/projects">
            {project.name}
          </a>
        </Table.Cell>
        <Table.Cell>
          {#if deployment.status === "queued"}
            <Badge variant="outline">
              <Loader/>
              Queued
            </Badge>
          {:else if deployment.status === "building"}
            <Badge>
              <Pickaxe/>
              Building
            </Badge>
          {:else if deployment.status === "success"}
            <Badge class="bg-green-600 text-white">
              <CircleCheck/>
              Success
            </Badge>
          {:else if deployment.status === "failed"}
            <Badge variant="destructive">
              <CircleX/>
              Failed
            </Badge>
          {/if}
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>