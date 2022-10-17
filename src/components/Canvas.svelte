<script lang="ts">
    import CanvasController from "../controllers/canvas";
    import {onMount} from "svelte";

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
    // TODO: Optional pointer crosshair from css
    // TODO: Pointer color change
    // TODO: Background line color optional
    // TODO: dots background

    onMount(() => {
        if(canvasContext !== null) {
            canvasHelper = new CanvasController(canvasContext, gridBackground);
        }
    })

    function mouseMoveEvent(e: MouseEvent) {
        canvasHelper.mouseMoveEvent(e)
    }

    function mouseWheelEvent(e: WheelEvent) {
        e.preventDefault();
        canvasHelper.wheelEvent(e);
    }

    function mouseDownEvent(e: MouseEvent) {
        e.preventDefault();
        canvasHelper.mouseDownEvent(e);
    }

    function mouseUpEvent(e: MouseEvent) {
        canvasHelper.mouseUpEvent(e);
    }

    function deRegisterEvents() {
    }

    function registerEvents() {
    }

</script>



<canvas bind:this={canvasContext}
        on:mousedown={mouseDownEvent}
        on:mouseup={mouseUpEvent}
        on:wheel={mouseWheelEvent}
        on:mousemove={mouseMoveEvent}
        on:mouseleave={deRegisterEvents}
        on:mouseenter={registerEvents}
>

</canvas>


<style>
    canvas {
        position:absolute;
        left:0;
        top:0;
    }
</style>
