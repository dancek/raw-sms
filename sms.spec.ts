import 'jest';

import {Ringtone, OperatorLogo} from './sms';

xdescribe('Ringtone', () => {
	it ('should read RTTTL and output correct hex', () => {
		const rtttl = 'Wastelands:o=4,d=4,b=130,l=4:8f,8f#,g#,a5,f#,8b,8c#,d#,8e,8f,g,c,a,f#,d#,8f,8f#,g#,a5,f#,8b,8c#,d#,d,c,b,c,b,a,2a,c,2a#.'
		const hex = '024A3A695D85CDD195B185B991CC0408511CCAE82CC2EC32849A420BA0E30930A20AB0B30C208A0D20BA0A20B30BB0CA1269082E838C24C288268228388228388348344228365000';
		
		const tone = new Ringtone()
		tone.fromRTTTL(rtttl)

		expect(tone.toHex()).toEqual(hex)
	});
});

describe('OperatorLogo', () => {
	const hex = '42f45000480e013c07bc40f07f079ff81e0f3c60f0ffc79ff81e0f3c70f1ffe79ff80f1e3c78f1f3c783c00f1e3c7cf3e08783c007bc3c7ef3c00783c007bc3c7ff3c00783c003b83c7ff3c00783c003f83c7bf3e08783c001f03c79f1f3c783c001f03c78f1ffe783c000e03c7870ffc783c000e03c78307f0783c0004000001000000000'

	it('should parse a 72x14 OTA bitmap from hex', () => {
		const logo = OperatorLogo.fromHex(hex)

		expect(logo.mcc).toEqual(244);
		expect(logo.mnc).toEqual(5);
		expect(logo.data.length).toEqual(72*14);
	});

	it('should recreate the same hex', () => {
		const logo = OperatorLogo.fromHex(hex)

		expect(logo.toHex()).toEqual(hex);		
	});
});