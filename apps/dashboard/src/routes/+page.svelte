<script lang="ts">
  import * as deployments from "$lib/remote/deployments.remote"
</script>

{#each await deployments.list() as deployment}
  {JSON.stringify(deployment)}
{/each}