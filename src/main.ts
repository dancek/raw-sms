import * as m from 'mithril';

import {createCanvasListeners, initCanvas} from './logo-editor';
import {OperatorLogo} from './sms';

import {DataComponent} from './component/data';

function main(): void {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    const logo: OperatorLogo = getLogo();
    const ctx: CanvasRenderingContext2D = initCanvas(canvas, logo);

    // EVENT HANDLERS

    {
        const [mousedown, mousemove, mouseup] = createCanvasListeners(canvas, ctx, logo);
        canvas.addEventListener('mousedown', mousedown);
        canvas.addEventListener('mousemove', mousemove);
        document.body.addEventListener('mouseup', mouseup);
    }

    document.getElementById('clear-logo').addEventListener('click', () => {
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

    m.render(document.getElementById('mithril-root'), m(DataComponent, {logo}));
}

function getLogo(): OperatorLogo {
    // 72*14 = 1008 bits in base64: 1008 / 6 = 168 chars; add 1 for the beginning hash
    if (location.hash.length === 168 + 1) {
        return OperatorLogo.fromBase64(location.hash.substring(1));
    }

    // default: Vincit logo
    return OperatorLogo.fromBase64('PAe8QPB/B5/4Hg88YPD/x5/4Hg88cPH/55/4Dx48ePHzx4PADx48fPPgh4PAB7w8fvPAB4PAB7w8f/' +
        'PAB4PAA7g8f/PAB4PAA/g8e/Pgh4PAAfA8efHzx4PAAfA8ePH/54PAAOA8eHD/x4PAAOA8eDB/B4PAAEAAABAAAAAA');
}

main();
