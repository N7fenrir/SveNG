<script lang="ts">
    import CanvasController from "../controllers/canvas";
    import {onMount} from "svelte";

    export let width;
    export let height;
    export let dotsBackground = {
        dots : {
            radius : 2,
            cellWidth: 25,
            cellHeight: 25,
            xStart: 10,
            yStart: 2,
            fillStyle: "#000"
        }
    }

    export let gridBackground = {
        grid : {
            adaptive : false,
            gridLimit : 64,
            gridSize: 128,
            gridScreenSize: 128,
        }
    }

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
            canvasHelper = new CanvasController(canvasContext, gridBackground);
        }
    })

    // TODO: Fix drag
    function mouseMoveEvent(e: MouseEvent) {
        console.log("moving", e)
    }

    function mouseWheelEvent(e: WheelEvent) {
        canvasHelper.wheelEvent(e);
    }

    function mouseButtonEvent(e: MouseEvent) {
        canvasHelper.mouseButtonEvent(e);
    }

</script>



<canvas bind:this={canvasContext}
        on:mousedown={mouseButtonEvent}
        on:mouseUp={mouseButtonEvent}
        on:wheel={mouseWheelEvent}
        style="width: {width}; height: {height} ; border: 1px solid black"
>

</canvas>
