import {OperatorLogo} from './sms'
import {initCanvas, createCanvasListeners} from './logo-editor';

function main(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');

    const logo: OperatorLogo = getLogo();
    const ctx: CanvasRenderingContext2D = initCanvas(canvas, logo);

    // EVENT HANDLERS

    {
        const [mousedown, mousemove, mouseup] = createCanvasListeners(canvas, ctx, logo);
        canvas.addEventListener('mousedown', mousedown);
        canvas.addEventListener('mousemove', mousemove);
        document.body.addEventListener('mouseup', mouseup);
    }

    document.getElementById('clear-logo').addEventListener('click', function() {
        logo.clear();
        initCanvas(canvas, logo);
    });


    // CHANGE LISTENERS

    function setUrlHash() {
        location.hash = logo.toBase64();
    }

    logo.subscribe(setUrlHash, "bitmap");

    // first calls
    setUrlHash();
}

function getLogo(): OperatorLogo {
    // 72*14 = 1008 bits in base64: 1008 / 6 = 168 chars; add 1 for the beginning hash
    if (location.hash.length == 168 + 1) {
        return OperatorLogo.fromBase64(location.hash.substring(1));
    } 

    // default: Vincit logo
    return OperatorLogo.fromHex('42f45000480e013c07bc40f07f079ff81e0f3c60f0ffc79ff81e0f3c70f1ffe79ff80f1e3c78f1f3c783c00f1e3c7cf3e08783c007bc3c7ef3c00783c007bc3c7ff3c00783c003b83c7ff3c00783c003f83c7bf3e08783c001f03c79f1f3c783c001f03c78f1ffe783c000e03c7870ffc783c000e03c78307f0783c0004000001000000000');
}

main();