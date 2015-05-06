module SMS {
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
	
	class Ringtone implements IMessageContent {
		name: string;
		tempo: number;
		melody: Note[];
		
		fromHex(data: string): void {
			
		};
		toHex(): string {
			var notes: string = '';
			return `${this.name}:b=${this.tempo}:${notes}`;
		};
	}
	
	class Note {
		pitch: string;
		octave: number;
		duration: number;
	}
}