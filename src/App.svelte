<script lang="ts">
    import Canvas from "./components/Canvas.svelte";
    import type {INode} from "./types";
    import {SHAPES} from "./types";

    export let width = "100vw";
    export let height = "100vh";

    const newNode =  {
        id: 4,
        x: 500,
        y: 100,
        shape: {
            circle : {
                radius: 35,
            },
        },
        style: {
            default: {
                fillColor: "pink",
                strokeColor: "blue",
                strokeWidth: 9
            },
            onHover: {
                fillColor: "#00cc99",
                strokeColor: "00cc99",
                strokeWidth: 15
            },
            onSelect: {
                fillColor: "#00cc99",
                strokeColor: "00cc99",
                strokeWidth: 5
            }
        },
        content: "ASD"
    }

    function onNodeSelect(node: INode) {
        console.log("Selected Node", node);
        // Checking Create Node option
        nodes.push(newNode);
        // Checking Node Update
        nodes[2].shape[SHAPES.POLYGON].width = 25;
    }

    function onNodeHover(node: INode) {
        console.log("Hovered Node", node)
    }

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
        },
    }

    export let nodes: INode[] = [
        {
            id: 1,
            x: 100,
            y: 100,
            shape: {
                circle : {
                    radius: 25,
                },
            },
            style: {
                default: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 2
                },
                onHover: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 15
                },
                onSelect: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 5
                }
            },
            content: "ASD"
            },

        {
            id: 2,
            x: 200,
            y: 100,
            shape: {
                quad : {
                    width: 75,
                    height: 35
                },
            },
            style: {
                default:{
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 2
                },
                onHover: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 5

                },
                onSelect: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 5

                }
            },
            content: "ASD"
        },
        {
            id: 3,
            x: 300,
            y: 100,
            shape: {
                quad : {
                    width: 100,
                    height: 50
                },
            },
            style: {
                default:{
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 2
                },
                onHover: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 15

                },
                onSelect: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 5
                }
            },
            content: "ASD"
        },
    ]



</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas nodes={nodes}  background={dotsBackground} {onNodeSelect} {onNodeHover} />
</div>
