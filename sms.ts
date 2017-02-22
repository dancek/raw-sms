interface IMessage {
	header: UDH;
	body: IMessageContent;
}

interface IMessageContent {
	toHex(): string;
	fromHex(string): void;
}

enum MessageType {
	OperatorLogo,
	Ringtone
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
	};
	toHex(): string {
		switch (this.type) {
			case MessageType.OperatorLogo: return '06050415820000';
			case MessageType.Ringtone: return '06050415810000';
		}
	};
}

export class Ringtone implements IMessageContent {
	name: string;
	tempo: number;
	melody: Note[];
	
	fromHex(data: string): void {
		
	};
	fromRTTTL(data: string): void {
		
	};
	toHex(): string {
		// FIXME: convert to hex
		// TODO: optimize default octave and duration
		var notes: string = this.melody.map(x => x.toString()).join(',');
		return `${this.name}:b=${this.tempo}:${notes}`;
	};
}

class Note {
	pitch: string;
	octave: number;
	// duration is one of 1,2,4,8,16,32; dotted also affects actual duration
	duration: number;
	dotted: boolean;
	
	toString(): string {
		var dot = this.dotted ? '.' : '';
		return `${this.duration}${this.pitch}${dot}${this.octave}`;
	};
}

export class OperatorLogo implements IMessageContent {
	mcc: number;
	mnc: number;
	data: Array<boolean>; // 72x14 bitmap
	
	new() {
		this.data = new Array<boolean>(72*14);

		// default to Elisa (Finland)
		this.mcc = 244;
		this.mnc = 5;
	}
	
	static fromHex(raw: string) {
		const logo = new OperatorLogo();
		logo.fromHex(raw);
		return logo;
	}

	fromHex(raw: string) {
		const mccmnc = raw.slice(0, 6);
		const otb = raw.slice(6);

		[this.mcc, this.mnc] = this.parseMccMnc(mccmnc);
		this.data = this.parseHexOtb(otb);
	}

	/**
	 * Convert OTA bitmap (as hex string) to Array<boolean>
	 */
	parseHexOtb(otb: string): Array<boolean> {
		const otaHeader = otb.slice(0, 8);
		const bitmap = otb.slice(8);

		// convert in pieces, concatenate the arrays
		return [].concat.apply([], 
			bitmap.split('') // split into hex characters, ie. 4 bits
				.map(this.hexCharToBits)
		);
	}

	/**
	 * Convert a hex character to a 4-bit tuple of booleans
	 */
	hexCharToBits(char: string): [boolean, boolean, boolean, boolean] {
		const n = parseInt(char);
		// assert 0 <= char < 16

		// get bits using bitwise AND
		return [Boolean(n & 8), Boolean(n & 4), Boolean(n & 2), Boolean(n & 1)]
	}

	/**
	 * Parse MCC+MNC used in OTB hex
	 * 
	 * First two octets are MCC (filled with F), the third MNC. All are little-endian BCD.
	 * E.g. MCC 123 -> 21 F3, MNC 45 -> 54 would together be 21F354.
	 */
	parseMccMnc(hex: string): [number, number] {
		const mcc = parseInt(hex[1] + hex[0] + hex[3]);
		const mnc = parseInt(hex[5] + hex[4]);
		return [mcc, mnc];
	}

	toHex(): string {
		return '';
	}		
}
