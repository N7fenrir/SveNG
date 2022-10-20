import type {IMousePointer} from "../types";

const mouse : IMousePointer = {
    x : 0,
    y : 0,
    clientX: 0,
    clientY: 0,
    wheel : 0,
    lastX : 0,
    lastY : 0,
    pan : false,
    drag: false,
    button:false,
}

export {mouse}