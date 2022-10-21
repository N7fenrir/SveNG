<script lang="ts">
    import Canvas from "./components/Canvas.svelte";
    import type {INode} from "./types";

    export let width = "100vw";
    export let height = "100vh";

    const newNode: INode =  {
        id: 4,
        x: 500,
        y: 100,
        shape: {
            width: 35,
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
        }
    }

    function onNodeSelect(nodeID: string | number | undefined ) {
        // write what you want
    }

    function onNodeHover(nodeID: string) {
        // write what you want
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

    export let solidBackground = {
        solid : "grey"
    }

    export let nodes: INode[] = [
        {
            id: 1,
            x: 100,
            y: 100,
            shape: {
                width: 25
            },
            style: {
                default: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 2,
                    fontStyle: "16px sans-serif",
                    fontColor: "white"
                },
                onHover: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 15,
                    fontColor: "red"
                },
                onSelect: {
                    fillColor: "#00cc99",
                    strokeColor: "00cc99",
                    strokeWidth: 5,
                    fontColor: "black"
                }
            },
            display: {
                text: "1",
                textAlign: "center",
                textBaseLine: "middle",
            }
            },

        {
            id: 2,
            x: 200,
            y: 100,
            shape: {
                width: 75,
                height: 35
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
            display: {
                text: "2",
                textAlign: "center",
                textBaseLine: "middle",
            }
        },
        {
            id: 3,
            x: 300,
            y: 100,
            shape: {
                width: 75,
                height: 35
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
                },
            },
            display: {
                text: "3",
                textAlign: "center",
                textBaseLine: "middle",
            }
            },
    ]



</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas nodes={nodes}  background={dotsBackground} {onNodeSelect} {onNodeHover} />
</div>
