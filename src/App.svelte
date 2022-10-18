<script lang="ts">
    import Canvas from "./components/Canvas.svelte";

    export let width = "100vw";
    export let height = "100vh";

</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas />
</div>
