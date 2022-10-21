const TEXT_ALIGN = ["left", "right", "center"] as const;
const TEXT_BASELINE = ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'] as const;

interface ICanvasBackground {
    grid? : ICanvasGrid,
    dots? : ICanvasDots,
    solid? : string
}

interface ICanvasGrid {
    gridLimit : number,
    gridSize: number,
    gridScreenSize: number,
    adaptive: boolean;
    strokeColor?: string;
}

interface ICanvasDots {
    lineWidth : number,
    gap: number,
    fillStyle: string
}

interface IMousePointer {
    x : number;
    y : number;
    button: boolean;
    wheel : number;
    lastX : number;
    lastY : number;
    clientX : number;
    clientY : number;
    pan : boolean;
    drag: boolean;
}

interface IPoint {
    x: number;
    y: number;
}

interface IPanZoomHandler {
    x: number,
    y: number,
    scale: number,
    apply: (ctx: CanvasRenderingContext2D) => void,
    scaleAt: (x: number, y: number, sc: number) => void,
    toWorld: (x: number, y: number, point: IPoint) => IPoint
}


interface IShape {
    width: number;
    height?: number,
}


enum POINTERS {
    GRAB = "grab",
    POINTER = "pointer",
    CROSS = "crosshair",
    DEFAULT = "default",
}

interface IInteractedNodes {
    selectedNode: INode;
    hoveredNode: INode;
    hoveredEdge: IEdge;
    selectedEdge: IEdge;
}



interface INode {
    id: number | string;
    x: number;
    y:number;
    shape: IShape;
    style?: {
        default: IHoverAndSelectStyle,
        onHover?: IHoverAndSelectStyle,
        onSelect?: IHoverAndSelectStyle
    }
    display?: TNodeDisplay,
    image?: {
        src: string;
        altText: string;
        resizeToFit: boolean
    }
}


interface IEdge {
    id: number | string;
    from:  INode;
    to: INode;
    shape? : IShape
    style?: {
        default: IHoverAndSelectStyle,
        onHover?: IHoverAndSelectStyle,
        onSelect?: IHoverAndSelectStyle
    }
    display?: TNodeDisplay,
}

type TNodeDisplay = {
    text: string;
    textAlign?: typeof TEXT_ALIGN[number];
    textBaseLine?: typeof TEXT_BASELINE[number];
}


interface IHoverAndSelectStyle {
    fillColor: string,
    strokeColor: string
    strokeWidth: number;
    fontStyle?: string;
    fontColor?: string
}

interface ICanvasElementOperations {
    node : IObjectOperations;
}

interface IObjectOperations {
        onSelect?: (nodeID: string | number | undefined) => void,
        onHover?: (nodeID: string | number | undefined) => void
}


export type {ICanvasBackground, ICanvasGrid, ICanvasDots, IMousePointer, IPoint, IPanZoomHandler, INode, IEdge, IShape, IInteractedNodes, IHoverAndSelectStyle, TNodeDisplay,  ICanvasElementOperations}
export { POINTERS}