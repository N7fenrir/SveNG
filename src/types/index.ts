const TEXT_ALIGN = ["left", "right", "center"] as const;
const TEXT_BASELINE = ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'] as const;

// TODO: Transform type ICIRLCE and IPOLYGON to a singular Interface. only width compulsion, height optional.

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
    drag : boolean;
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


interface IPolygon {
    width: number;
    height: number,
}

interface ICircle {
    radius: number,
}

enum SHAPES {
    POLYGON = "quad",
    CIRCLE = "circle"
}

enum POINTERS {
    GRAB = "grab",
    POINTER = "pointer",
    CROSS = "crosshair",
    DEFAULT = "default",
}

interface IInteractedNodes {
    selected: INode;
    hovered: INode;
}



interface INode {
    id: number | string;
    x: number;
    y:number;
    shape: {
        [SHAPES.POLYGON]? : IPolygon,
        [SHAPES.CIRCLE]? : ICircle,
    };
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


export type {ICanvasBackground, ICanvasGrid, ICanvasDots, IMousePointer, IPoint, IPanZoomHandler, INode, IPolygon, ICircle, IInteractedNodes, IHoverAndSelectStyle, TNodeDisplay,  ICanvasElementOperations}
export {SHAPES, POINTERS}