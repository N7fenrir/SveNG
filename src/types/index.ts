interface ICanvasBackground {
    grid? : ICanvasGrid,
    dots? : ICanvasDots,
}

interface ICanvasGrid {
    gridLimit : number,
    gridSize: number,
    gridScreenSize: number,
    adaptive: boolean
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

export type {ICanvasBackground, ICanvasGrid, ICanvasDots, IMousePointer, IPoint, IPanZoomHandler}