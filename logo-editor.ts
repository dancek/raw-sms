import {OperatorLogo} from './sms'

export function initCanvas(canvas: HTMLCanvasElement, logo: OperatorLogo): CanvasRenderingContext2D {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    (<any>ctx).imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    ctx.putImageData(logo.toImageData(), 0, 0);

    return ctx;
}

function mouseToPixelCoordinates(canvas: HTMLCanvasElement, event: MouseEvent): [number, number] {
    const box: ClientRect = canvas.getBoundingClientRect();

    const canvasX = event.clientX - box.left;
    const canvasY = event.clientY - box.top;
    
    // consider zoom
    const pixelX = Math.floor(72 * (canvasX / box.width));
    const pixelY = Math.floor(14 * (canvasY / box.height));

    return [pixelX, pixelY];
}

type MouseEventListener = (event: MouseEvent) => void;
type Triple<T> = [T, T, T];

/**
 * @returns mousedown, mousemove and mouseup listeners
 */
export function createCanvasListeners(canvas: HTMLCanvasElement,
                                      ctx: CanvasRenderingContext2D,
                                      logo: OperatorLogo)
                                      : Triple<MouseEventListener> {

    // state shared between listeners
    var dragging: boolean = false,
        color: boolean = false;
    
    function updatePixel(x: number, y: number) {
        // don't update if not necessary
        if (logo.getPixel(x, y) == color) return;

        // update both logo and canvas with current color
        const changedPixel: ImageData = logo.setPixel(x, y, color);
        ctx.putImageData(changedPixel, x, y);
    }

    function canvasMouseDownListener(event: MouseEvent) {
        const [x, y] = mouseToPixelCoordinates(canvas, event);

        dragging = true;
        color = !logo.getPixel(x, y);

        updatePixel(x, y);
    };

    function canvasMouseMoveListener(event: MouseEvent) {
        if (!dragging) return;

        const [x, y] = mouseToPixelCoordinates(canvas, event);
        updatePixel(x, y);
    };

    function canvasMouseUpListener(event: MouseEvent) {
        dragging = false;
    };

    return [canvasMouseDownListener, canvasMouseMoveListener, canvasMouseUpListener];
}