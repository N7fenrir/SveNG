<script lang="ts">
    import Canvas from "./components/Canvas.svelte";
    import type {IEdge, INode} from "./types";

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

    function onObjectSelect(objectID: string | number | undefined ) {
        // write what you want
        console.log(objectID)
    }

    function onObjectHover(objectID: string) {
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
            display: {
                text: "1",
                font :"Times New Roman",
                textAlign: "center",
                textBaseLine: "middle",
            },
            style: {
                default: {
                    fillColor: "#00cc99",
                    strokeColor: "black",
                    strokeWidth: 2,
                    textColor: "black",
                    textSize: "16px",
                    textStyle: "sans-serif",
                },
                onHover: {
                    fillColor: "blue",
                    strokeColor: "pink",
                    strokeWidth: 15,
                    textColor: "black",
                    textSize: "16px",
                    textStyle: "sans-serif",
                },
                onSelect: {
                    fillColor: "red",
                    strokeColor: "orange",
                    strokeWidth: 5,
                    textColor: "black",
                    textSize: "16px",
                    textStyle: "sans-serif",
                }
            },
            },
        {
            id: 2,
            x: 200,
            y: 100,
            shape: {
                width: 75,
                height: 35
            },
            display: {
                text: "2",
                font :"Times New Roman",
                textAlign: "center",
                textBaseLine: "middle",
            },
            style: {
                default: {
                    fillColor: "#00cc99",
                    strokeColor: "black",
                    strokeWidth: 2,
                    textColor: "black",
                    textSize: "1rem",
                    textStyle: "sans-serif",
                },
                onHover: {
                    fillColor: "blue",
                    strokeColor: "pink",
                    strokeWidth: 15,
                    textColor: "black",
                    textSize: "1rem",
                    textStyle: "sans-serif",
                },
                onSelect: {
                    fillColor: "red",
                    strokeColor: "orange",
                    strokeWidth: 5,
                    textColor: "black",
                    textSize: "1rem",
                    textStyle: "sans-serif",
                }
            },
        }
    ]
    export let edges: IEdge[] = [{
        id: "e1",
        from: nodes[0],
        to: nodes[1],
        shape : {
            width: 15,
        },
        style: {
            default: {
                strokeColor: "pink",
                textColor: "black",
                textSize: "1rem",
                textStyle: "sans-serif",
            },
            onHover: {
                lineWidth: 18,
                strokeColor: "blue",
                textColor: "black",
                textSize: "2rem",
                textStyle: "sans-serif",

            },
            onSelect: {
                lineWidth: 20,
                strokeColor: "red",
                textColor: "black",
                textSize: "3rem",
                textStyle: "sans-serif",
            }
        },
        display: {
            text: "1",
            textAlign: "center",
            textBaseLine: "middle",
            font :"Times New Roman"
        }
    },
        ]


</script>



<div style="
    width: {width};
    height: {height};
    ">
    <Canvas {nodes} {edges} background={dotsBackground} {onObjectSelect} {onObjectHover} />
</div>
