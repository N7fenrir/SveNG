import type {ICanvasBackground, IMousePointer, IPanZoomHandler} from "../types";
import {GRIDLIMIT, GRIDSCREENSIZE, SCALERATE, TOPLEFT} from "../static";
import {panZoom} from "./panZoom";


class CanvasController {


    private readonly canvas: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;
    private readonly mouse: IMousePointer;
    private readonly background: ICanvasBackground = undefined;
    private panZoomHandler: IPanZoomHandler;
    private  canvasWidth: number;
    private  canvasHeight: number;

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.mouse = {x : 0, y : 0, wheel : 0, lastX : 0, lastY : 0, drag : false, button:false };
        this.panZoomHandler = panZoom;
        this.background = background;
        this.canvasContext = canvas.getContext("2d");

        this.updateFrame = this.updateFrame.bind(this);
        this.drawBackground = this.drawBackground.bind(this);

        this.reRender();
    }



    public drawBackground(background: ICanvasBackground) {
        if("grid" in background) {
            this.drawGrid();
        }
    }

    private drawGrid(): void {
        let gridScale, size, x, y;
            gridScale = GRIDSCREENSIZE;
            size = Math.max(this.canvasWidth, this.canvasHeight) / this.panZoomHandler.scale + gridScale * 2;
            this.panZoomHandler.toWorld(0,0, TOPLEFT);
            x = Math.floor(TOPLEFT.x / gridScale) * gridScale;
            y = Math.floor(TOPLEFT.y / gridScale) * gridScale;
            if (size / gridScale > GRIDLIMIT) {
                size = gridScale * GRIDLIMIT;
            }
            this.panZoomHandler.apply(this.canvasContext);
            this.canvasContext.lineWidth = 1;
            this.canvasContext.strokeStyle = "#000";
            this.canvasContext.beginPath();
            for (let i = 0; i < size; i += gridScale) {
                this.canvasContext.moveTo(x + i, y);
                this.canvasContext.lineTo(x + i, y + size);
                this.canvasContext.moveTo(x, y + i);
                this.canvasContext.lineTo(x + size, y + i);
            this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
            this.canvasContext.stroke();
        }
    }

    private mouseEventBoundsCalc(e: MouseEvent | WheelEvent): void {
        const bounds = this.canvas.getBoundingClientRect();
        this.mouse.x = e.pageX - bounds.left - scrollX;
        this.mouse.y = e.pageY - bounds.top - scrollY;
    }

    public mouseButtonEvent(e: MouseEvent) : void {
        this.mouse.button = e.type === "mousedown" ? true : e.type === "mouseup" ? false : this.mouse.button;
    }

    public mouseMoveEvent(e: MouseEvent) : void {
        this.mouseEventBoundsCalc(e);
    }

    public wheelEvent(e: WheelEvent): void {
        this.mouseEventBoundsCalc(e);
        if(e.type === "wheel"){
            this.mouse.wheel += -e.deltaY;
            e.preventDefault();
        }
    }

    private drawPointer(x: number, y: number) : void {
        const worldCoordinate = this.panZoomHandler.toWorld(x, y, {x:0, y:0});
        this.panZoomHandler.apply(this.canvasContext);
        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = "red";
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(worldCoordinate.x - 10, worldCoordinate.y);
        this.canvasContext.lineTo(worldCoordinate.x + 10, worldCoordinate.y);
        this.canvasContext.moveTo(worldCoordinate.x, worldCoordinate.y - 10);
        this.canvasContext.lineTo(worldCoordinate.x, worldCoordinate.y + 10);
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0); //reset the transform so the lineWidth is 1
        this.canvasContext.stroke();
    }


    public updateFrame(): void {
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        this.canvasContext.globalAlpha = 1;           // reset alpha
        if (this.canvasWidth !== innerWidth || this.canvasHeight !== innerHeight) {
            this.canvasWidth = this.canvas.width = innerWidth;
            this.canvasHeight =  this.canvas.height = innerHeight;
        } else {
            this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        if (this.mouse.wheel !== 0) {
            let scale = this.mouse.wheel < 0 ? 1 / SCALERATE : SCALERATE;
            this.mouse.wheel *= 0.8;
            if(Math.abs(this.mouse.wheel) < 1){
                this.mouse.wheel = 0;
            }
            panZoom.scaleAt(this.mouse.x, this.mouse.y, scale);
        }
        // TODO: Fix drag
        if (this.mouse.button) {
            if (!this.mouse.drag) {
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                this.mouse.drag = true;
            } else {
                panZoom.x += this.mouse.x - this.mouse.lastX;
                panZoom.y += this.mouse.y - this.mouse.lastY;
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
            }
        } else if (this.mouse.drag) {
            this.mouse.drag = false;
        }
        this.drawBackground(this.background);
        this.drawPointer(this.mouse.x, this.mouse.y)
        this.reRender();
    }


    private reRender() {
        requestAnimationFrame(this.updateFrame);
    }

}


export default CanvasController;