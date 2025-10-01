<script lang="ts">
  // noinspection ES6UnusedImports
  import { Card } from "$lib/components/ui"
  import * as projects from "$lib/remote/projects.remote"
  import * as deployments from "$lib/remote/deployments.remote"
</script>

<div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {#each await projects.list() as project}
    <Card.Root>
      <Card.Header>
        <Card.Title>{project.name}</Card.Title>
        <Card.Description>
          <a href={project.repoUrl} target="_blank">
            {#if project.repoUrl.startsWith("https://github.com/")}
              {project.repoUrl.replace("https://github.com/", "")}
            {/if}
          </a>
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {@const projectDeployments = await deployments.list({ project: project.id })}
        {projectDeployments.length} {projectDeployments.length === 1 ? "deployment" : "deployments"}
      </Card.Content>
    </Card.Root>
  {/each}
</div>