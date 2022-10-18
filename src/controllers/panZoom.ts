import type {IPoint, IPanZoomHandler} from "../types";

const panZoom : IPanZoomHandler = {
    x : 0,
    y : 0,
    scale : 1,
    apply(ctx) { ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
    scaleAt(x, y, sc): void {
        this.scale *= sc;
        this.x = x - (x - this.x) * sc;
        this.y = y - (y - this.y) * sc;
    },
    toWorld(x, y, point: IPoint = {x : 0, y: 0}): IPoint {
        const inv = 1 / this.scale;
        point.x = (x - this.x) * inv;
        point.y = (y - this.y) * inv;
        return point;
    }
}

export {panZoom}