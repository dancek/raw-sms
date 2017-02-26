import {OperatorLogo} from './sms'

main();

function main(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');

    const logo: OperatorLogo = OperatorLogo.fromHex('42f45000480e013c07bc40f07f079ff81e0f3c60f0ffc79ff81e0f3c70f1ffe79ff80f1e3c78f1f3c783c00f1e3c7cf3e08783c007bc3c7ef3c00783c007bc3c7ff3c00783c003b83c7ff3c00783c003f83c7bf3e08783c001f03c79f1f3c783c001f03c78f1ffe783c000e03c7870ffc783c000e03c78307f0783c0004000001000000000');

    const ctx: CanvasRenderingContext2D = initCanvas(canvas, logo);

    {
        const [mousedown, mousemove, mouseup] = createCanvasListeners(canvas, ctx, logo);
        canvas.addEventListener('mousedown', mousedown);
        canvas.addEventListener('mousemove', mousemove);
        canvas.addEventListener('mouseup', mouseup);
    }
}

function initCanvas(canvas: HTMLCanvasElement, logo: OperatorLogo): CanvasRenderingContext2D {
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

/**
 * @returns mousedown, mousemove and mouseup listeners
 */
function createCanvasListeners(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, logo: OperatorLogo):
[(e: MouseEvent) => void, (e: MouseEvent) => void, (e: MouseEvent) => void] {

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