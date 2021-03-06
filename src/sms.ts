import {Change, Publisher} from './pubsub';

interface IMessage {
    header: UDH;
    body: IMessageContent;
}

interface IMessageContent {
    toHex(): string;
    fromHex(data: string): void;
}

enum MessageType {
    OperatorLogo,
    Ringtone,
}

export class Message<T extends IMessageContent> implements IMessage {
    header: UDH;
    body: T;
}

class UDH {
    /**
     * User data header
     *
     * Currently a very stupid implementation that returns predefined strings.
     * The structure in current strings is as follows
     * 		06 	  length of UDH in octets
     * 		05    16-bit port addressing (needed for Smart Messaging)
     * 		04    length of port addressing section
     * 		1582  destination port (operator logo)
     * 		0000  source port (any 16-bit port is ok)
     *
     * Some of the available ports are
     * Ringtone - 1581
     * CGI /CLI - 1583
     * Picture Msg- 158A
     * Operator Logo 1582
     * vCard 23F4
     * vCard Secure 23F6
     * vCalendar 23F5
     * vCalendar Secure 23F7
     * eMail Notification 1588
     * DMCP(obsolete) 1584
     */
    type: MessageType;
    fromHex(data: string): void {
        if (/^..05041581/.test(data)) this.type = MessageType.Ringtone;
        if (/^..05041582/.test(data)) this.type = MessageType.OperatorLogo;
    }
    toHex(): string {
        switch (this.type) {
            case MessageType.OperatorLogo: return '06050415820000';
            case MessageType.Ringtone: return '06050415810000';
        }
    }
}

export class Ringtone implements IMessageContent {
    name: string;
    tempo: number;
    melody: Note[];

    fromHex(data: string): void {
        // TODO
    }
    fromRTTTL(data: string): void {
        // TODO
    }
    toHex(): string {
        // FIXME: convert to hex
        // TODO: optimize default octave and duration
        const notes: string = this.melody.map((x) => x.toString()).join(',');
        return `${this.name}:b=${this.tempo}:${notes}`;
    }
}

class Note {
    pitch: string;
    octave: number;
    // duration is one of 1,2,4,8,16,32; dotted also affects actual duration
    duration: number;
    dotted: boolean;

    toString(): string {
        let dot = this.dotted ? '.' : '';
        return `${this.duration}${this.pitch}${dot}${this.octave}`;
    }
}

export class OperatorLogo extends Publisher implements IMessageContent {
    static fromHex(raw: string) {
        const logo = new OperatorLogo();
        logo.fromHex(raw);
        return logo;
    }

    static fromBase64(base64: string) {
        const logo = new OperatorLogo();
        logo.fromBase64(base64);
        return logo;
    }

    // TODO: setters that use publish()
    mcc: number;
    mnc: number;

    private data: boolean[]; // 72x14 bitmap. (true = black, false = transparent)

    new() {
        // default to Elisa (Finland)
        this.mcc = 244;
        this.mnc = 5;

        // init bitmap
        this.clear();
    }

    clear() {
        this.data = new Array<boolean>(72 * 14).fill(false);
        this.publish();
    }

    fromHex(raw: string) {
        const mccmnc = raw.slice(0, 6);
        const otb = raw.slice(6);

        [this.mcc, this.mnc] = this.parseMccMnc(mccmnc);
        this.data = this.parseHexOtb(otb);

        this.publish();
    }

    fromBase64(base64: string) {
        this.data = this.binaryToBitmap(atob(base64));
        this.publish();
    }

    /**
     * Convert OTA bitmap (as hex string) to Array<boolean>
     */
    parseHexOtb(otb: string): boolean[] {
        const otaHeader = otb.slice(0, 8); // assert == 0048 0e01
        const bitmap = otb.slice(8);

        // convert in pieces, concatenate the arrays
        return [].concat.apply([],
            bitmap.split('') // split into hex characters, ie. 4 bits
                .map(this.hexCharToBits),
        );
    }

    /**
     * Convert a hex character to a 4-bit tuple of booleans
     */
    hexCharToBits(char: string): [boolean, boolean, boolean, boolean] {
        const n = parseInt(char, 16);
        // assert 0 <= char < 16

        // get bits using bitwise AND
        // tslint:disable-next-line:no-bitwise
        return [Boolean(n & 8), Boolean(n & 4), Boolean(n & 2), Boolean(n & 1)];
    }

    /**
     * Parse MCC+MNC used in OTB hex
     *
     * First two octets are MCC (filled with F), the third MNC. All are little-endian BCD.
     * E.g. MCC 123 -> 21 F3, MNC 45 -> 54 would together be 21F354.
     */
    parseMccMnc(hex: string): [number, number] {
        const mcc = parseInt(hex[1] + hex[0] + hex[3], 10);
        const mnc = parseInt(hex[5] + hex[4], 10);
        return [mcc, mnc];
    }

    bitmapToHex(bits: boolean[]): string {
        let hex = '';

        // convert to hex "manually", four bits per hex character
        for (let i = 0; i < bits.length; i += 4) {
            // In js, true * 8 == 8 and false * 8 == 0. Allow this for perf.
            const n =
                (bits[i] as any) * 8 +
                (bits[i + 1] as any) * 4 +
                (bits[i + 2] as any) * 2 +
                (bits[i + 3] as any) * 1;
            hex += n.toString(16);
        }
        return hex;
    }

    bitmapToBinary(bits: boolean[]): string {
        const bytes: number[] = [];

        for (let i = 0; i < bits.length; i += 8) {
            // In js, true * 8 == 8 and false * 8 == 0. Allow this for perf.
            const n =
                (bits[i] as any) * 128 +
                (bits[i + 1] as any) * 64 +
                (bits[i + 2] as any) * 32 +
                (bits[i + 3] as any) * 16 +
                (bits[i + 4] as any) * 8 +
                (bits[i + 5] as any) * 4 +
                (bits[i + 6] as any) * 2 +
                (bits[i + 7] as any) * 1;
            bytes.push(n);
        }
        return String.fromCharCode.apply(null, bytes);
    }

    binaryToBitmap(raw: string): boolean[] {
        const bits: boolean[] = [];
        let byte: number;
        let bit: boolean;

        // this is probably slow, but we only run this rarely
        for (let i = 0; i < raw.length; i++) {
            byte = raw.charCodeAt(i);
            for (let exp = 7; exp >= 0; exp--) {
                // tslint:disable-next-line:no-bitwise
                bit = Boolean(byte & (1 << exp));
                bits.push(bit);
            }
        }

        return bits;
    }

    /**
     * @param mcc MCC as a three-character zero-padded string
     * @param mnc MNC as a two-character zero-padded string
     */
    mccmncToHex(mcc: string, mnc: string) {
        return `${mcc[1]}${mcc[0]}f${mcc[2]}${mnc[1]}${mnc[0]}`;
    }

    toHex(): string {
        const mccmnc = this.mccmncToHex(zeroPad(this.mcc, 3), zeroPad(this.mnc, 2));
        const otaHeader = '00480e01'; // 72x14 1-bit, ie. the only size we support
        const bitmap = this.bitmapToHex(this.data);

        return mccmnc + otaHeader + bitmap;
    }

    toImageData(): ImageData {
        // create the RGBA image data, initialized to transparent black (ie. 0)
        const rawData = new Uint8ClampedArray(72 * 14 * 4);

        for (let i = 0; i < this.data.length; i += 1) {
            // premature optimization: just change opacity of black pixels.
            // ie. RGBA for black is (0,0,0,255) and white/transparent is (0,0,0,0)
            if (this.data[i]) {
                rawData[4 * i + 3] = 255;
            }
        }

        return new ImageData(rawData, 72, 14);
    }

    toBase64(): string {
        const raw = this.bitmapToBinary(this.data);
        return btoa(raw);
    }

    getPixel(x: number, y: number) {
        return this.data[72 * y + x];
    }

    /**
     * Toggle a single pixel and return a 1x1 ImageData representing it.
     */
    setPixel(x: number, y: number, value: boolean): ImageData {
        // assert 0 <= x < 72, 0 <= y < 14
        this.data[72 * y + x] = value;

        // FIXME: should this be published at all?
        this.publish( {
            type: "pixel",
            data: {
                x,
                y,
                value,
            },
        } as Change);

        const pixel = new Uint8ClampedArray([0, 0, 0, value ? 255 : 0]);
        const img = new ImageData(pixel, 1, 1);
        return img;
    }
}

function zeroPad(n: number, len: number): string {
    const s = String(n);
    return Array(len - s.length + 1).join('0') + s;
}
