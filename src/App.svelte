<script lang="ts">
    import Canvas from "./components/Canvas.svelte";
    import type {INode} from "./types";

    export let width = "100vw";
    export let height = "100vh";

    export let gridBackground = {
        grid : {
            adaptive : false,
            gridLimit : 32,  // max grid lines for static grid
            gridSize: 128,  // grid size in screen pixels for adaptive and world pixels for static
            gridScreenSize: 128,  // U get it
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

    export let nodes: INode[] = [
        {
            id: 1,
            posX: 100,
            posY: 100,
            shape: {
                circle : {
                    radius: 25,
                },
            },
            style: {
                fillColor: "#00cc99",
            },
            content: "ASD"
            },

        {
            id: 2,
            posX: 200,
            posY: 100,
            shape: {
                quad : {
                    width: 15,
                    height: 30
                },
            },
            style: {
                fillColor: "#00cc99",
            },
            content: "ASD"
        },
        {
            id: 3,
            posX: 20000,
            posY: 100,
            shape: {
                quad : {
                    width: 15,
                    height: 30
                },
            },
            style: {
                fillColor: "#00cc99",
            },
            content: "ASD"
        },
    ]


</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas nodes={nodes}  background={dotsBackground} />
</div>
