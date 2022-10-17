import {GRIDLIMIT, GRIDSCREENSIZE, SCALERATE, TOPLEFT} from "../static";
import {panZoom} from "./panZoom";
import {mouse} from "./mouse";
import type {ICanvasBackground, ICanvasGrid } from "../types";


class CanvasController {


    private readonly canvas: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;
    private readonly background: ICanvasBackground = undefined;

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.background = background;
        this.canvasContext = canvas.getContext("2d");

        this.updateFrame = this.updateFrame.bind(this);
        requestAnimationFrame(this.updateFrame);
    }

    public mouseDownEvent(e: MouseEvent) : void {
        if(!mouse.button){
            this.mouseEventBoundsCalc(e);
            mouse.button = true
        }
    }

    public mouseUpEvent(e: MouseEvent) : void {
        if(mouse.button) {
            this.mouseEventBoundsCalc(e);
            mouse.button = false;
        }
    }

    public mouseMoveEvent(e: MouseEvent) : void {
        this.mouseEventBoundsCalc(e);
    }

    public wheelEvent(e: WheelEvent): void {
        this.mouseEventBoundsCalc(e);
        mouse.wheel += -e.deltaY;
    }

    private mouseEventBoundsCalc(e: MouseEvent | WheelEvent): void {
        let bounds = this.canvas.getBoundingClientRect();
        mouse.x = e.clientX - bounds.left;
        mouse.y = e.clientY - bounds.top;
    }

    private updateFrame(): void {
        this.resetCanvasTransformAndAlpha()
        this.canvasSafetyBounds();
        this.perFrameCheckZoomPan();
        this.perFrameDrawBackgroundAndPointer();
        requestAnimationFrame(this.updateFrame);
    }

    private checkForZoom() {
        if (mouse.wheel !== 0) {
            let scale = mouse.wheel < 0 ? 1 / SCALERATE : SCALERATE;
            mouse.wheel *= 0.8;
            if(Math.abs(mouse.wheel) < 1){
                mouse.wheel = 0;
            }
            panZoom.scaleAt(mouse.x, mouse.y, scale);
        }
    }

    private checkForPan() {
        if (mouse.button) {
            if (!mouse.drag) {
                mouse.lastX = mouse.x;
                mouse.lastY = mouse.y;
                mouse.drag = true;
            } else {
                panZoom.x += mouse.x - mouse.lastX;
                panZoom.y += mouse.y - mouse.lastY;
                mouse.lastX = mouse.x;
                mouse.lastY = mouse.y;
            }
        } else if (mouse.drag) {
            mouse.drag = false;
        }
    }

    private drawPointer() : void {
        // @ts-ignore optional parameter p
        const worldCoordinate = panZoom.toWorld(mouse.x, mouse.y);
        panZoom.apply(this.canvasContext);
        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = "red";
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(worldCoordinate.x - 10, worldCoordinate.y);
        this.canvasContext.lineTo(worldCoordinate.x + 10, worldCoordinate.y);
        this.canvasContext.moveTo(worldCoordinate.x, worldCoordinate.y - 10);
        this.canvasContext.lineTo(worldCoordinate.x, worldCoordinate.y + 10);
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        this.canvasContext.stroke();
    }

    private resetCanvasTransformAndAlpha(): void {
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        this.canvasContext.globalAlpha = 1;
    }

    private canvasSafetyBounds() : void {
        if (this.canvas.width !== innerWidth || this.canvas.height !== innerHeight) {
            this.canvas.width = this.canvas.width = innerWidth;
            this.canvas.height =  this.canvas.height = innerHeight;
        } else {
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    private perFrameCheckZoomPan(): void {
        this.checkForZoom();
        this.checkForPan();
    }

    private perFrameDrawBackgroundAndPointer(): void{
        this.drawBackground();
        this.drawPointer()
    }

    private drawBackground() {
        if("grid" in this.background) {
            this.drawGrid(this.background.grid);
        }
    }

    private drawGrid(grid: ICanvasGrid): void {
        let scale, gridScale, size, x, y;
        if (grid.adaptive) {
            scale = 1 / panZoom.scale;
            gridScale = 2 ** (Math.log2(GRIDSCREENSIZE * scale) | 0);
            size = Math.max(this.canvas.width, this.canvas.height) * scale + gridScale * 2;
            x = ((-panZoom.x * scale - gridScale) / gridScale | 0) * gridScale;
            y = ((-panZoom.y * scale - gridScale) / gridScale | 0) * gridScale;
        }
        else {
            gridScale = GRIDSCREENSIZE;
            size = Math.max(this.canvas.width, this.canvas.height) / panZoom.scale + gridScale * 2;
            panZoom.toWorld(0,0, TOPLEFT);
            x = Math.floor(TOPLEFT.x / gridScale) * gridScale;
            y = Math.floor(TOPLEFT.y / gridScale) * gridScale;
            if (size / gridScale > GRIDLIMIT) {
                size = gridScale * GRIDLIMIT;
            }
        }
        panZoom.apply(this.canvasContext);
        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = "#000";
        this.canvasContext.beginPath();
        for (let i = 0; i < size; i += gridScale) {
            this.canvasContext.moveTo(x + i, y);
            this.canvasContext.lineTo(x + i, y + size);
            this.canvasContext.moveTo(x, y + i);
            this.canvasContext.lineTo(x + size, y + i);
        }
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
        this.canvasContext.stroke();
    }

}


export default CanvasController;