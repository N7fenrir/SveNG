<script lang="ts">
    import CanvasController from "../controllers/canvas";
    import {onMount} from "svelte";

    export let width ;
    export let height;

    let canvasContext = null;
    let canvasHelper;


    // TODO: Infinite Canvas
    // TODO: Background (default: dotted Grid)
    // TODO: Add Zoom
    // TODO: Pan Canvas
    // TODO: Nodes
    // TODO: Edges
    // TODO: Node Styles
    // TODO: Edge Styles
    // TODO: Configurable Buttons
    // TODO: Background (add infinite animation, solid Colors)
    // TODO: Add Node
    // TODO: Delete Node
    // TODO: Select node
    // TODO: Update Node

    onMount(() => {
        if(canvasContext !== null) {
            canvasHelper = new CanvasController(canvasContext);
        }
    })

</script>



<canvas bind:this={canvasContext} style="width: {width}; height: {height} ; border: 1px solid black ">

</canvas>
