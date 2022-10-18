<script lang="ts">
    import CanvasController from "../controllers/canvas";
    import {onMount} from "svelte";

    export let gridBackground = {
        grid : {
            adaptive : false,
            gridLimit : 32,
            gridSize: 128,
            gridScreenSize: 128,
            strokeColor: "#ff009c",
        }
    }


    export let dotsBackground = {
        dots : {
            lineWidth : 4, // dot size
            gap: 64, // controls density
            fillStyle: "#000000" // dots color size
        }
    }

    let canvasContext = null;
    let canvasHelper;


    onMount(() => {
        if(canvasContext !== null) {
            canvasHelper = new CanvasController(canvasContext, dotsBackground);
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
