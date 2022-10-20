import {
    DEFAULT_BLACK,
    DEFAULT_LINE_WIDTH,
    DEFAULT_SOLID,
    DEFAULT_TEXT_STYLE,
    DEFAULT_WHITE,
    SCALE_RATE,
    TEXT_ALIGN,
    TEXT_BASELINE,
    TOP_LEFT
} from "../static";
import {panZoom} from "./panZoom";
import {mouse} from "./mouse";
import type {
    ICanvasBackground,
    ICanvasElementOperations,
    IHoverAndSelectStyle,
    INode,
    IPoint,
    INodeShape
} from "../types";
import Store from "./store";

class CanvasController {

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly background: ICanvasBackground = undefined;
    private readonly drawBackground: () => void;
    private graphHandle: Store;
    private operations!: ICanvasElementOperations;

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.background = background;
        this.ctx = canvas.getContext("2d");
        this.graphHandle = new Store()
        this.updateFrame = this.updateFrame.bind(this);
        this.drawBackground = this.setupBackgroundFunc();
    }

    public mouseDownEvent(e: MouseEvent) : void {
        if(!mouse.button){
            this.mouseEventBoundsCalc(e);
            mouse.button = true
            this.checkAndToggleSelectedNode();
        }
    }

    public mouseUpEvent(e: MouseEvent) : void {
        if(mouse.button) {
            this.mouseEventBoundsCalc(e);
            mouse.button = false;
            this.dropNode(e);
        }
    }

    private checkAndToggleSelectedNode() : void {
        if(this.graphHandle.current.hovered) {
            if(this.graphHandle.current.selected !== this.graphHandle.current.hovered) {
                this.graphHandle.current.selected = this.graphHandle.current.hovered;
            } else {
                this.graphHandle.current.selected = undefined;
            }
            this.operations.node.onSelect(this.graphHandle.current.selected?
                this.graphHandle.current.selected.id : undefined);
        }
    }

    // TODO: Refactor Code
    private dropNode(e: MouseEvent): void {
        if(this.graphHandle.current.selected) {
            const selected = this.graphHandle.current.selected;
            this.graphHandle.current.selected.shape.height?
            function() {
                selected.x =  e.clientX - selected.shape.width / 2;
                selected.y = e.clientY - selected.shape.height / 2;
            }() : function () {
                    selected.x = e.clientX;
                    selected.y = e.clientY;
            } ();
            this.graphHandle.current.selected = undefined;
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
        this.graphHandle.nodes = nodes;
    };

    public setupOps(operations: ICanvasElementOperations): void {
        this.operations = operations;
    }

    /* ------------------------------- Background Related ------------------------------- */

    private setupBackgroundFunc(): () => void {
        if("solid" in this.background) {
            this.canvas.style.backgroundColor = this.background? this.background.solid : DEFAULT_SOLID ;
        }
        if("dots" in this.background) {
            return this.drawDots
        }
        if("grid" in this.background) {
            this.background.grid.strokeColor  = this.background.grid.strokeColor ? this.background.grid.strokeColor : DEFAULT_BLACK
            return this.background.grid.adaptive? this.adaptiveGrid : this.nonAdaptiveGrid
        }
    }

    private adaptiveGrid(): void {
        let scale, gridScale, size, x, y;
        scale = 1 / panZoom.scale;
        gridScale = 2 ** (Math.log2(this.background.grid.gridScreenSize * scale) | 0);
        size = Math.max(this.canvas.width, this.canvas.height) * scale + gridScale * 2;
        x = ((-panZoom.x * scale - gridScale) / gridScale | 0) * gridScale;
        y = ((-panZoom.y * scale - gridScale) / gridScale | 0) * gridScale;
        this.drawGridLines(x,y,size, gridScale)
    }

    private nonAdaptiveGrid(): void {
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
        this.ctx.translate(panZoom.x, panZoom.y);
        this.renderNodes();
    }

    private resetCanvasTransformAndAlpha(): void {
        this.graphHandle.current.hovered = undefined;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0 );
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
        // this.drawPointer()
    }

    private renderNodes() : void {
        this.drawAllNodes()
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
            if (!mouse.pan) {
                mouse.lastX = mouse.x;
                mouse.lastY = mouse.y;
                this.graphHandle.current.selected?
                mouse.drag = true :
                mouse.pan = true;
            } else {
                panZoom.x += mouse.x - mouse.lastX;
                panZoom.y += mouse.y - mouse.lastY;
                mouse.lastX = mouse.x;
                mouse.lastY = mouse.y;
            }
        } else if (mouse.pan) {
            mouse.pan = false;
            mouse.drag = false;
        }
    }

    private mouseEventBoundsCalc(e: MouseEvent | WheelEvent): void {
        let bounds = this.canvas.getBoundingClientRect();
        mouse.clientX = e.clientX;
        mouse.clientY = e.clientY;
        mouse.x = mouse.clientX - bounds.left;
        mouse.y = mouse.clientY - bounds.top;
    }

    /* *******************************  Mouse Events ******************************* */


    /* ------------------------------- Nodes Related ------------------------------- */

    private drawAllNodes(): void {
        this.graphHandle.nodes.forEach((node: INode ) => {
            const out = this.checkIfNodeOutOfBounds(node);
            if(!out){
                this.drawNode(node);
            }
        });
    }

    private drawNode(node: INode) : void {
        this.setStyle(node.style.default);
        this.ctx.beginPath();
        this.renderShape(node);
        this.ctx.closePath();
        this.setupNodeHoverAttr(node);
        this.ctx.stroke();
        this.ctx.fill();
        node.display? this.writeNodeContent(node) : () => {};
    }

    private writeNodeContent(node: INode) : void {
        this.ctx.textAlign = node.display?.textAlign || TEXT_ALIGN;
        this.ctx.textBaseline = node.display?.textBaseLine || TEXT_BASELINE;
        this.ctx.fillStyle = node.style.default.fontColor || DEFAULT_WHITE;
        if(this.graphHandle.current.hovered === node) {
            this.ctx.fillStyle = node.style.onHover.fontColor || DEFAULT_WHITE;
        }
        if(this.graphHandle.current.selected === node) {
            this.ctx.fillStyle = node.style.onSelect.fontColor || DEFAULT_WHITE;
        }
        const textPos : IPoint = this.getTextPosForNode(node);
        this.ctx.fillText(node.display?.text, textPos.x, textPos.y);
    }

    private getTextPosForNode(node: INode) : IPoint {
        let x = node.x * panZoom.scale;
        let y = node.y * panZoom.scale
        return node.shape.height?
            {x : x + (node.shape.width * panZoom.scale / 2), y: y + (node.shape.height  * panZoom.scale / 2)} :
            {x: x  , y: y }
    }

    private setupNodeHoverAttr(node: INode): void {
        if (this.ctx.isPointInPath(mouse.x, mouse.y)) {
            this.onHoverOps(node);
        }
        if(this.graphHandle.current.selected === node) {
            this.setStyle(node.style.onSelect);
        }
    }

    private onHoverOps(node: INode): void {
        this.graphHandle.current.hovered = node;
        this.operations.node.onHover(this.graphHandle.current.hovered.id)
        this.setStyle(node.style.onHover);
    }

    private setStyle(style: IHoverAndSelectStyle) : void {
        this.ctx.font = style?.fontStyle || DEFAULT_TEXT_STYLE;
        this.ctx.lineWidth = style?.strokeWidth || DEFAULT_LINE_WIDTH;
        this.ctx.strokeStyle = style?.strokeColor || DEFAULT_BLACK;
        this.ctx.fillStyle = style?.fillColor || DEFAULT_WHITE;
    }

    // TODO: Refactor and optimize
    private renderShape(node: INode): void {
        const ctx = this.ctx;
        const current = this.graphHandle.current.selected
        let pos : IPoint = {
            x : node.x * panZoom.scale,
            y : node.y * panZoom.scale
        }
        node.shape.height?
            function() {
                if(current === node && mouse.drag) {
                    // @ts-ignore
                    let p = panZoom.toWorld(mouse.x, mouse.y);
                    pos.x = p.x * panZoom.scale - (node.shape.width /2);
                    pos.y =  p.y * panZoom.scale - (node.shape.height /2);
                    node.x = pos.x;
                    node.y = pos.y;
                }
                ctx.rect(pos.x, pos.y, node.shape.width  * panZoom.scale, node.shape.height  * panZoom.scale)
            }():
            function() {
                if(current === node && mouse.drag) {
                    // @ts-ignore
                    let p = panZoom.toWorld(mouse.x, mouse.y);
                    pos.x = p.x * panZoom.scale;
                    pos.y =  p.y * panZoom.scale;
                    node.x = pos.x;
                    node.y = pos.y;
                }
                ctx.arc(pos.x, pos.y, node.shape.width * panZoom.scale, 0, 2 * Math.PI);
            }()
    }


    private checkIfNodeOutOfBounds(node: INode) : boolean {
        const shape = this.getShapeBound(node.shape);
        return (
            (node.x + shape) * panZoom.scale + panZoom.x < 0 ||
            (node.y + shape) * panZoom.scale + panZoom.y < 0 ||
            (node.x - shape) * panZoom.scale + panZoom.x > this.canvas.width ||
            (node.y - shape) * panZoom.scale + panZoom.y > this.canvas.height
        );
    }

    private getShapeBound(shape: INodeShape): number {
        return shape.height ? Math.max(shape.width, shape.height) : shape.width;
    }

    /* *******************************  Nodes Related ******************************* */


}


export default CanvasController;