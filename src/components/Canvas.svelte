<script lang="ts">
    import CanvasController from "../controllers/canvas";
    import {onMount} from "svelte";
    import type {INode} from "../types";


    export let background;
    export let nodes: INode[];
    export let onNodeSelect: (node: INode) => void = () => {};
    export let onNodeHover: (node: INode) => void = () => {};

    let canvasContext = null;
    let canvasHelper;

    const nodeOps = {
        onSelect : onNodeSelect,
        onHover : onNodeHover
    }


    onMount(() => {
        if(canvasContext !== null) {
            canvasHelper = new CanvasController(canvasContext, background);
            canvasHelper.setupInitialNodes(nodes);
            canvasHelper.setupOps( {node: nodeOps })
            canvasHelper.requestRedraw();
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



</script>



<canvas bind:this={canvasContext}
        on:mousedown={mouseDownEvent}
        on:mouseup={mouseUpEvent}
        on:wheel={mouseWheelEvent}
        on:mousemove={mouseMoveEvent}
>

</canvas>


<style>
    canvas {
        position:absolute;
        left:0;
        top:0;
    }
</style>
