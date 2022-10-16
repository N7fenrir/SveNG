<script lang="ts">
    import Canvas from "./components/Canvas.svelte";

    export let width = "100%";
    export let height = "100%";

</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas {width} {height} />
</div>
