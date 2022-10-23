import {
    ALL_TEXT_PADDING,
    DEFAULT_BLACK,
    DEFAULT_LINE_WIDTH,
    DEFAULT_SOLID,
    DEFAULT_WHITE,
    EDGE_ARROW_HEAD,
    EDGE_ARROW_RADIAN,
    SCALE_RATE,
    TEXT_ALIGN,
    TEXT_BASELINE,
    TOP_LEFT
} from "../static";
import {panZoom} from "./panZoom";
import {mouse} from "./mouse";
import type {
    ICanvasBackground,
    IObjectOperations,
    IHoverAndSelectStyle,
    INode,
    IEdge,
    IShape,
    IPoint, IEdgeActionStyles
} from "../types";
import Store from "./store";
import { getIntersectionPoint } from "../utils";

class CanvasController {

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly background: ICanvasBackground = undefined;
    private readonly drawBackground: () => void;
    private storeHandle: Store;
    private operations!: IObjectOperations;

    constructor(canvas: HTMLCanvasElement, background: ICanvasBackground) {
        this.canvas = canvas;
        this.background = background;
        this.ctx = canvas.getContext("2d");
        this.storeHandle = new Store()
        this.updateFrame = this.updateFrame.bind(this);
        this.drawBackground = this.setupBackgroundFunc();
    }

    public mouseDownEvent(e: MouseEvent) : void {
        if(!mouse.button){
            this.mouseEventBoundsCalc(e);
            mouse.button = true
            this.checkAndToggleSelectedNode();
            this.checkAndToggleSelectedEdge();
        }
    }

    public mouseUpEvent(e: MouseEvent) : void {
        mouse.drag = false;
        if(mouse.button) {
            this.mouseEventBoundsCalc(e);
            mouse.button = false;
        }
    }

    private checkAndToggleSelectedNode() : void {
        if(this.storeHandle.current.hoveredNode) {
            if(this.storeHandle.current.selectedNode !== this.storeHandle.current.hoveredNode) {
                this.storeHandle.current.selectedNode = this.storeHandle.current.hoveredNode
            } else {
                this.storeHandle.current.selectedNode = undefined;
            }
        } else {
            this.storeHandle.current.selectedNode = undefined;
        }
        this.operations.onObjectSelect(this.storeHandle.current.selectedNode ? this.storeHandle.current.selectedNode.id : undefined);
    }

    private checkAndToggleSelectedEdge() : void {
        if(this.storeHandle.current.hoveredEdge) {
            if(this.storeHandle.current.selectedEdge !== this.storeHandle.current.hoveredEdge) {
                this.storeHandle.current.selectedEdge = this.storeHandle.current.hoveredEdge
            } else {
                this.storeHandle.current.selectedEdge = undefined;
            }
        } else {
            this.storeHandle.current.selectedEdge = undefined;
        }
        this.operations.onObjectSelect(this.storeHandle.current.selectedEdge ? this.storeHandle.current.selectedEdge.id : undefined);
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
        this.storeHandle.nodes = nodes;
    };

    public setupInitialEdges(edges: IEdge[]) : void {
        this.storeHandle.edges = edges;
    }

    public setupOps(operations: IObjectOperations): void {
        this.operations = operations;
    }

    /* ------------------------------- Background Related ------------------------------- */

    private setupBackgroundFunc(): () => void {
        if("solid" in this.background) {
            this.canvas.style.backgroundColor = this.background? this.background.solid : DEFAULT_SOLID ;
            return () => {}
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
        this.drawBackground();
        this.ctx.translate(panZoom.x, panZoom.y);
        this.renderNodes();
        this.renderEdges();
    }

    private resetCanvasTransformAndAlpha(): void {
        this.storeHandle.current.hoveredNode = undefined;
        this.storeHandle.current.hoveredEdge = undefined;

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

    private renderNodes() : void {
        this.drawAllNodes()
    }

    private renderEdges() : void {
        this.drawAllEdges()
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
                this.storeHandle.current.selectedNode?
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
        this.storeHandle.nodes.forEach((node: INode ) => {
            const out = this.checkIfNodeOutOfBounds(node);
            if(!out){
                this.drawNode(node);
            }
        });
    }

    private drawNode(node: INode) : void {
        this.setStyle(node.style.default);
        this.ctx.beginPath();
        const nodePos = this.renderShape(node);
        this.ctx.closePath();
        this.setupNodeHoverAttr(node);
        this.ctx.stroke();
        this.ctx.fill();
        if(node.display) this.writeNodeContent(node, nodePos);
    }

    private writeNodeContent(node: INode, nodePos: IPoint) : void {
        this.ctx.globalCompositeOperation = "source-over"
        this.ctx.textAlign = node.display?.textAlign || TEXT_ALIGN;
        this.ctx.textBaseline = node.display?.textBaseLine || TEXT_BASELINE;
        this.ctx.fillStyle = node.style.default.textColor || DEFAULT_WHITE;
        this.ctx.font = `${node.style.default.textSize} ${node.display.font}`;
        if(this.storeHandle.current.hoveredNode === node) {
            this.ctx.fillStyle = node.style.onHover.textColor || DEFAULT_WHITE;
            this.ctx.font = `${node.style.onHover.textSize} ${node.display.font}`;
        }
        if(this.storeHandle.current.selectedNode === node) {
            this.ctx.fillStyle = node.style.onSelect.textColor || DEFAULT_WHITE;
            this.ctx.font = `${node.style.onHover.textSize} ${node.display.font}`;
        }
        this.ctx.fillText(node.display?.text, nodePos.x, nodePos.y);
        this.ctx.restore();
    }

    private setupNodeHoverAttr(node: INode): void {
        if (this.ctx.isPointInPath(mouse.x, mouse.y)) {
            this.onNodeHoverOps(node);
        }
        if(this.storeHandle.current.selectedNode === node) {
            this.setStyle(node.style.onSelect);
        }
    }

    private onNodeHoverOps(node: INode): void {
        this.storeHandle.current.hoveredNode = node;
        this.operations.onObjectHover(this.storeHandle.current.hoveredNode.id)
        this.setStyle(node.style.onHover);
    }

    private setStyle(style: IHoverAndSelectStyle) : void {
        this.ctx.lineWidth = style?.strokeWidth || DEFAULT_LINE_WIDTH;
        this.ctx.strokeStyle = style?.strokeColor || DEFAULT_BLACK;
        this.ctx.fillStyle = style?.fillColor || DEFAULT_WHITE;
    }

    private renderShape(node: INode): IPoint {
        let pos =  {
            x: node.x * panZoom.scale,
            y: node.y * panZoom.scale
        };
        if(this.storeHandle.current.selectedNode === node && mouse.drag) {
            pos = this.getShapeDragAndDropPos(pos);
            if(!mouse.button) {
                mouse.drag = false;
                this.storeHandle.current.selectedNode = undefined;
            }
        }
        node.shape.height?
            (
                this.ctx.rect(pos.x, pos.y, node.shape.width  * panZoom.scale, node.shape.height  * panZoom.scale),
                pos = {x : pos.x + (node.shape.width * panZoom.scale/ 2), y: pos.y + (node.shape.height * panZoom.scale / 2)}
            ) : this.ctx.arc(pos.x, pos.y, node.shape.width * panZoom.scale, 0, 2 * Math.PI)
        return pos;
    }

    private getShapeDragAndDropPos(pos: IPoint) : IPoint {
        // @ts-ignore
        let p = panZoom.toWorld(mouse.x, mouse.y);
        pos = {x: p.x * panZoom.scale, y : p.y * panZoom.scale}
        if(this.storeHandle.current.selectedNode.shape.height) {
            pos = {
                x : pos.x - (this.storeHandle.current.selectedNode.shape.width * panZoom.scale /2),
                y: pos.y - (this.storeHandle.current.selectedNode.shape.height  * panZoom.scale /2)
            }
        }
        this.storeHandle.current.selectedNode.x = pos.x / panZoom.scale;
        this.storeHandle.current.selectedNode.y = pos.y / panZoom.scale;
        return pos
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

    private getShapeBound(shape: IShape): number {
        return shape.height ? Math.max(shape.width, shape.height) : shape.width;
    }

    /* *******************************  Nodes Related ******************************* */


    /* ------------------------------- Edges Related ------------------------------- */


    private drawAllEdges(): void {
        this.ctx.globalCompositeOperation = "destination-over";
        this.ctx.textAlign = TEXT_ALIGN;
        this.ctx.textBaseline = TEXT_BASELINE;
        this.storeHandle.edges.forEach((edge: IEdge ) => {
            const out = this.checkIfEdgeOutOfBounds(edge);
            if(!out){
                this.drawEdge(edge);
            }
        });
        this.ctx.restore();
    }

    private getStartEndPoints(edge: IEdge): Record<string, number> {
        const isMovingSourceNode =
            mouse.drag && edge.from === this.storeHandle.current.selectedNode;

        const isMovingTargetNode =
            mouse.drag && edge.to === this.storeHandle.current.selectedNode;
        let sX, sY;

        const sourceX = isMovingSourceNode ? mouse.x : edge.from.x;
        const sourceY = isMovingSourceNode ? mouse.y : edge.from.y;

        const targetX = isMovingTargetNode ? mouse.x : edge.to.x;
        const targetY = isMovingTargetNode ? mouse.y : edge.to.y;

        const dx = targetX - sourceX;
        const dy = targetY - sourceY;

        const rad = Math.atan2(dy, dx);
        const sinr = Math.sin(rad);
        const cosr = Math.cos(rad);

        if(edge.from.shape.height) {
            sX = edge.from.x + edge.from.shape.width / 2
            sY = edge.from.y + edge.from.shape.height / 2

        } else {
            sX = edge.from.x
            sY = edge.from.y
        }

        const [startX, startY] = getIntersectionPoint(
            targetX,
            targetY,
            sX,
            sY,
            edge.shape
        );

        let lineEndX, lineEndY;

        edge.to.shape.height? [lineEndX, lineEndY] = this.calcLineCoords(edge.to) : [lineEndX, lineEndY] = [edge.to.x, edge.to.y];
        const [endX, endY] = getIntersectionPoint(
            startX,
            startY,
            lineEndX,
            lineEndY,
            edge.to.shape);


        const edgeLineOffset = this.ctx.lineWidth * Math.cos(EDGE_ARROW_RADIAN);
        lineEndX = endX - cosr * edgeLineOffset;
        lineEndY = endY - sinr * edgeLineOffset;

        return {
            startX : startX * panZoom.scale,
            startY : startY * panZoom.scale,
            endX : lineEndX * panZoom.scale,
            endY : lineEndY * panZoom.scale
        }
    }

    private checkIfEdgeOutOfBounds(edge: IEdge) : boolean {

        const source = edge.from;
        const target = edge.to;

        const sourceX = source.x * panZoom.scale + panZoom.x;
        const sourceY = source.y * panZoom.scale  + panZoom.y;
        const targetX = target.x * panZoom.scale  + panZoom.x;
        const targetY = target.y * panZoom.scale  + panZoom.y;

        const r = this.getShapeBound(edge.shape);

        return (
            (sourceX < -r && targetX < -r) ||
            (sourceY < -r && targetY < -r) ||
            (sourceX > this.canvas.width + r && targetX > this.canvas.width + r) ||
            (sourceY > this.canvas.height + r && targetY > this.canvas.height + r)
        );
    }

    private setEdgeStyle(style : IEdgeActionStyles, width: number): void {
        this.ctx.strokeStyle = style.strokeColor;
        this.ctx.lineWidth = style.lineWidth || width;
    }

    private drawEdge(edge: IEdge) : void {
        this.setEdgeStyle(edge.style.default, edge.shape.width);
        this.ctx.beginPath();
        this.renderArrow(this.getStartEndPoints(edge));
        this.checkForEdgeAction(edge)
        this.ctx.closePath();
        this.ctx.stroke();
        if(edge.display) this.writeEdgeContent(edge);
        this.ctx.restore();
    }

    private calcLineCoords(node: INode) : [number, number] {
        let X = node.x + node.shape.width / 2
        let Y = node.y + node.shape.height / 2
        if(mouse.drag && this.storeHandle.current.selectedNode === node){
            X = node.x + node.shape.width / 2
            Y =  node.y  + node.shape.height / 2
        }
        return [X, Y]
    }

    // TODO: try to fix this function
    // Thanks to: https://codepen.io/chanthy/pen/WxQoVG
    private renderArrow(pos : Record<string, number>){
        const {startX, startY, endX, endY} = pos;
        const angle = Math.atan2(endY-startY,endX-startX);

        //starting path of the arrow from the start square to the end square
        //and drawing the stroke
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        //starting a new path from the head of the arrow to one of the sides of
        //the point
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX-EDGE_ARROW_HEAD*Math.cos(angle-EDGE_ARROW_RADIAN),
            endY-EDGE_ARROW_HEAD*Math.sin(angle-EDGE_ARROW_RADIAN));

        //path from the side point of the arrow, to the other side point
        this.ctx.lineTo(endX-EDGE_ARROW_HEAD*Math.cos(angle+EDGE_ARROW_RADIAN),
            endY-EDGE_ARROW_HEAD*Math.sin(angle+EDGE_ARROW_RADIAN));

        //path from the side point back to the tip of the arrow, and then
        //again to the opposite side point
        this.ctx.lineTo(endX, endY);
        this.ctx.lineTo(endX-EDGE_ARROW_HEAD*Math.cos(angle-EDGE_ARROW_RADIAN),
            endY-EDGE_ARROW_HEAD*Math.sin(angle-EDGE_ARROW_RADIAN));
    }

    private checkForEdgeAction (edge: IEdge): void {
        if (this.ctx.isPointInStroke(mouse.x, mouse.y)) {
            this.onEdgeHoverOps(edge);
        }
        if(this.storeHandle.current.selectedEdge === edge) {
            this.setEdgeStyle(edge.style.onSelect, edge.shape.width);
        }
    }

    private onEdgeHoverOps(edge: IEdge): void {
        this.storeHandle.current.hoveredEdge = edge;
        this.operations.onObjectHover(this.storeHandle.current.hoveredEdge.id)
        this.setEdgeStyle(edge.style.onHover, edge.shape.width);
    }

    private writeEdgeContent(edge: IEdge){
        let p, pad;
        this.ctx.fillStyle = edge.style.default.textColor || DEFAULT_WHITE;
        this.ctx.font = `${edge.style.onHover.textSize} ${edge.display.font}`;
        const pt1 = edge.from;
        const pt2 = edge.to;
        const dx = (pt2.x * panZoom.scale - pt1.x * panZoom.scale);
        const dy = (pt2.y * panZoom.scale - pt1.y * panZoom.scale);
        const displayText = this.measureText(edge.display.text, Math.sqrt(dx*dx+dy*dy));

        p = pt1;
        pad = 1/2;

        if(this.storeHandle.current.hoveredEdge === edge) {
            this.ctx.fillStyle = edge.style.onHover.textColor || DEFAULT_WHITE;
            this.ctx.font = `${edge.style.onHover.textSize} ${edge.display.font}`;
        }
        if(this.storeHandle.current.selectedEdge === edge) {
            this.ctx.fillStyle = edge.style.onSelect.textColor || DEFAULT_WHITE;
            this.ctx.font = `${edge.style.onHover.textSize} ${edge.display.font}`;
        }

        this.ctx.save();
        this.ctx.globalCompositeOperation = "source-over"
        this.ctx.translate(p.x * panZoom.scale +dx *pad ,p.y * panZoom.scale +dy *pad );
        dx < 0 ? this.ctx.rotate(Math.atan2(dy,dx) - Math.PI) : this.ctx.rotate(Math.atan2(dy,dx));
        this.ctx.fillText(displayText,0,0);
        this.ctx.restore();
    }

    private measureText(text: string, len: number) : string {
        const avail = len - 2 * ALL_TEXT_PADDING;
        let toWrite = text
        if (this.ctx.measureText && this.ctx.measureText(toWrite).width > avail){
            while (toWrite && this.ctx.measureText(toWrite+"…").width > avail) toWrite = toWrite.slice(0,-1);
            toWrite += "…";
        }
        return toWrite;
    }


    /* *******************************  Edges Related ******************************* */


    /*

     let source = {x:  edge.from.x , y:  edge.from.y };
        let target = {x:  edge.to.x , y:  edge.to.y };
        let  p: IPoint, padding = 1, pad;

        let dx = edge.to.x - edge.from.x;
        let dy =  edge.to.y - edge.from.y;
        let angle = Math.atan2(dy,dx);
        const len = Math.sqrt(dx*dx+dy*dy);

        const text = this.measureText(edge.display.text, len)



        // Keep text upright
        if (angle < -Math.PI/2 || angle > Math.PI/2){
            p = source;
            source = target;
            target = p;
            dx *= -1;
            dy *= -1;
            angle -= Math.PI;
        }


        if (this.ctx.textAlign =='center'){
            p = {x:  edge.from.x , y:  edge.from.y };
            pad = 1/2;
        } else {
            const left = this.ctx.textAlign ==='left';
            p = left ? {x : edge.from.x, y: edge.from.y} : {x : edge.to.x, y: edge.to.y};
            pad = padding / Math.sqrt(dx*dx+dy*dy) * (left ? 1 : -1);
        }

        this.ctx.save();
        this.ctx.translate(p.x+dx*pad,p.y+dy*pad);
        this.ctx.rotate(Math.atan2(dy,dx));
        this.ctx.fillText(text,0,0);
        this.ctx.restore();
     */
}


export default CanvasController;