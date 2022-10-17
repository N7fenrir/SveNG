import type {IPoint} from "../types";
import type {IPanZoomHandler} from "../types";

const panZoom : IPanZoomHandler = {
    x : 0,
    y : 0,
    scale : 1,
    apply(ctx) { ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y) },
    scaleAt(x, y, sc) {
        this.scale *= sc;
        this.x = x - (x - this.x) * sc;
        this.y = y - (y - this.y) * sc;
    },
    toWorld(x, y, p: IPoint = {x : 0, y: 0} ): IPoint {
        const inv = 1 / this.scale;
        const point : IPoint = p as IPoint;
        point.x = (x - this.x) * inv;
        point.y = (y - this.y) * inv;
        return point;
    },
}

export {panZoom}