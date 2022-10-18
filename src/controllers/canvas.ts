import {GRIDLIMIT, GRIDSCREENSIZE, SCALERATE, TOPLEFT} from "../static";
import {panZoom} from "./panZoom";
import {mouse} from "./mouse";
import type {ICanvasBackground, ICanvasDots, ICanvasGrid} from "../types";


class CanvasController {


    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly background: ICanvasBackground = undefined;

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.background = background;
        this.ctx = canvas.getContext("2d");
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
        panZoom.apply(this.ctx);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "red";
        this.ctx.beginPath();
        this.ctx.moveTo(worldCoordinate.x - 10, worldCoordinate.y);
        this.ctx.lineTo(worldCoordinate.x + 10, worldCoordinate.y);
        this.ctx.moveTo(worldCoordinate.x, worldCoordinate.y - 10);
        this.ctx.lineTo(worldCoordinate.x, worldCoordinate.y + 10);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.stroke();
    }

    private resetCanvasTransformAndAlpha(): void {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalAlpha = 1;
    }

    private canvasSafetyBounds() : void {
        if (this.canvas.width !== innerWidth || this.canvas.height !== innerHeight) {
            this.canvas.width = this.canvas.width = innerWidth;
            this.canvas.height =  this.canvas.height = innerHeight;
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        if("dots" in this.background) {
            this.drawDots(this.background.dots)
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
        panZoom.apply(this.ctx);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        for (let i = 0; i < size; i += gridScale) {
            this.ctx.moveTo(x + i, y);
            this.ctx.lineTo(x + i, y + size);
            this.ctx.moveTo(x, y + i);
            this.ctx.lineTo(x + size, y + i);
        }
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
        this.ctx.stroke();
    }

    private drawDots(dots: ICanvasDots): void {
        const lw = dots.lineWidth * panZoom.scale;
        const gap = dots.gap * panZoom.scale;

        const offsetX = (panZoom.x % gap) - lw;
        const offsetY = (panZoom.y % gap) - lw;

        this.ctx.lineWidth = lw;
        this.ctx.strokeStyle = dots.fillStyle;

        this.ctx.beginPath();
        for (let i = offsetX; i < this.canvas.width + lw; i += gap) {
            this.ctx.moveTo(i, offsetY);
            this.ctx.lineTo(i, this.canvas.height + lw);
        }
        this.ctx.lineCap = "round";
        this.ctx.setLineDash([0, gap]);
        this.ctx.stroke();
        this.ctx.setLineDash([0]);
        this.ctx.lineCap =  "round";
    }

}


export default CanvasController;