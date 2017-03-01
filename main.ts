import {OperatorLogo} from './sms'
import {initCanvas, createCanvasListeners} from './logo-editor';

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

main();