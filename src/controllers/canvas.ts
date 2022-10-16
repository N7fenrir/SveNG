

class CanvasController {


    private canvas : HTMLCanvasElement;
    private canvasContext : CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext("2d");
    }




}


export default CanvasController;