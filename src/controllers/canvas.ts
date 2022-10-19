import {TOP_LEFT, SCALE_RATE, DEFAULT_BLACK, DEFAULT_SOLID, DEFAULT_LINE_WIDTH, DEFAULT_WHITE} from "../static";
import {panZoom} from "./panZoom";
import {mouse} from "./mouse";
import type {INode, ICanvasBackground, IPolygon, ICircle} from "../types";
import {SHAPES} from "../types";



class CanvasController {


    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly background: ICanvasBackground = undefined;
    private readonly drawBackground: () => void;
    private nodes: INode[];

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.background = background;
        this.ctx = canvas.getContext("2d");
        this.updateFrame = this.updateFrame.bind(this);
        this.drawBackground = this.setupBackgroundFunc();
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

    public requestRedraw() : void {
        requestAnimationFrame(this.updateFrame);
    }

    public setupInitialNodes(nodes: INode[]) : void {
        console.log(nodes);
        this.nodes = nodes;
    };

    private drawAllNodes(): void {
        this.nodes.forEach((node: INode ) => {
            const out = this.checkIfNodeOutOfBounds(node);
            if(!out && SHAPES.POLYGON in node.shape) {
                this.renderPolygon(node);
            }
            if(!out && SHAPES.CIRCLE in node.shape) {
                this.renderArc(node);
            }
        });
    }


    /* ------------------------------- Background Related ------------------------------- */

    private setupBackgroundFunc(): () => void {
        if("dots" in this.background) {
            return this.drawDots
        }
        if("grid" in this.background) {
            this.background.grid.strokeColor  = this.background.grid.strokeColor ? this.background.grid.strokeColor : DEFAULT_BLACK
            return this.background.grid.adaptive? this.adaptiveGrid : this.nonAdaptiveGrid
        }
        if("solid" in this.background) {
            return this.drawSolidBackgroundColor
        }
    }

    private drawSolidBackgroundColor() {
        this.ctx.fillStyle = this.background.solid? this.background.solid : DEFAULT_SOLID;
        this.ctx.fillRect(TOP_LEFT.x, TOP_LEFT.y, this.canvas.width, this.canvas.height);
    }

    private adaptiveGrid(): void {
        if(this.background.solid)  this.drawSolidBackgroundColor();
        let scale, gridScale, size, x, y;
        scale = 1 / panZoom.scale;
        gridScale = 2 ** (Math.log2(this.background.grid.gridScreenSize * scale) | 0);
        size = Math.max(this.canvas.width, this.canvas.height) * scale + gridScale * 2;
        x = ((-panZoom.x * scale - gridScale) / gridScale | 0) * gridScale;
        y = ((-panZoom.y * scale - gridScale) / gridScale | 0) * gridScale;
        this.drawGridLines(x,y,size, gridScale)
    }

    private nonAdaptiveGrid(): void {
        if(this.background.solid)  this.drawSolidBackgroundColor();
        let gridScale, size, x, y;
        gridScale = this.background.grid.gridScreenSize;
        size = Math.max(this.canvas.width, this.canvas.height) / panZoom.scale + gridScale * 2;
        panZoom.toWorld(0,0, TOP_LEFT);
        x = Math.floor(TOP_LEFT.x / gridScale) * gridScale;
        y = Math.floor(TOP_LEFT.y / gridScale) * gridScale;
        if (size / gridScale > this.background.grid.gridLimit) {
            size = gridScale * this.background.grid.gridLimit;
        }
        this.drawGridLines(x,y,size, gridScale)
    }

    private drawGridLines(x: number,y: number,size: number, gridScale: number) : void {
        panZoom.apply(this.ctx);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.background.grid.strokeColor;
        for (let i = 0; i < size; i += gridScale) {
            this.ctx.moveTo(x + i, y);
            this.ctx.lineTo(x + i, y + size);
            this.ctx.moveTo(x, y + i);
            this.ctx.lineTo(x + size, y + i);
        }
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
        this.ctx.stroke();
    }

    private drawDots(): void {
        if(this.background.solid)  this.drawSolidBackgroundColor();
        const lw = this.background.dots.lineWidth * panZoom.scale;
        const gap = this.background.dots.gap * panZoom.scale;

        const offsetX = (panZoom.x % gap) - lw;
        const offsetY = (panZoom.y % gap) - lw;

        this.ctx.lineWidth = lw;
        this.ctx.strokeStyle = this.background.dots.fillStyle;

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



    /* *******************************  Background Related ******************************* */


    /* ------------------------------- Update Frame Events ------------------------------- */

    private updateFrame(): void {
        this.resetCanvasTransformAndAlpha()
        this.canvasSafetyBounds();
        this.perFrameCheckZoomPan();
        this.perFrameRender();
        requestAnimationFrame(this.updateFrame);
    }

    private perFrameRender() {
        this.renderBackgroundAndPointer();
        this.renderNodes();
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

    private renderBackgroundAndPointer(): void{
        this.drawBackground();
        this.drawPointer()
    }

    private renderNodes() : void {
        this.drawAllNodes()
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


    /* *******************************  Update Frame Events ******************************* */


    /* ------------------------------- Mouse Events ------------------------------- */

    private checkForZoom() {
        if (mouse.wheel !== 0) {
            let scale = mouse.wheel < 0 ? 1 / SCALE_RATE : SCALE_RATE;
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

    private mouseEventBoundsCalc(e: MouseEvent | WheelEvent): void {
        let bounds = this.canvas.getBoundingClientRect();
        mouse.x = e.clientX - bounds.left;
        mouse.y = e.clientY - bounds.top;
    }


    /* *******************************  Mouse Events ******************************* */



    /* ------------------------------- Nodes Related ------------------------------- */


    private renderPolygon(node: INode): void {
        this.ctx.lineWidth = node.style?.borderThickness || DEFAULT_LINE_WIDTH;
        this.ctx.strokeStyle = node.style?.borderColor || DEFAULT_BLACK;
        this.ctx.fillStyle = node.style?.fillColor || DEFAULT_WHITE;

        this.ctx.beginPath();
        this.ctx.rect(node.posX, node.posY, node.shape[SHAPES.POLYGON].width, node.shape[SHAPES.POLYGON].height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    private renderArc(node: INode): void {
        this.ctx.fillStyle = node.style?.fillColor || DEFAULT_WHITE;
        this.ctx.lineWidth = node.style?.borderThickness || DEFAULT_LINE_WIDTH;
        this.ctx.strokeStyle = node.style?.borderColor || DEFAULT_BLACK;
        this.ctx.beginPath();
        this.ctx.arc(node.posX, node.posY, node.shape[SHAPES.CIRCLE].radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();
    }

    private checkIfNodeOutOfBounds(node: INode) : boolean {
        const shape = this.getShapeBound(node.shape);
        return (
            (node.posX + shape) * panZoom.scale + panZoom.x < 0 ||
            (node.posY + shape) * panZoom.scale + panZoom.y < 0 ||
            (node.posX - shape) * panZoom.scale + panZoom.x > this.canvas.width ||
            (node.posY - shape) * panZoom.scale + panZoom.y > this.canvas.height
        );
    }

    private getShapeBound(shape: { polygon?: IPolygon; circle?: ICircle; }): number {
        return SHAPES.CIRCLE in shape ? shape[SHAPES.CIRCLE].radius :  Math.max(shape[SHAPES.POLYGON].width, shape[SHAPES.POLYGON].height);
    }



    /* *******************************  Nodes Related ******************************* */






}


export default CanvasController;