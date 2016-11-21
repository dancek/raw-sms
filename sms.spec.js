describe('Ringtone', () => {
	it ('should read RTTTL and output correct hex', () => {
		var rtttl = 'Wastelands:o=4,d=4,b=130,l=4:8f,8f#,g#,a5,f#,8b,8c#,d#,8e,8f,g,c,a,f#,d#,8f,8f#,g#,a5,f#,8b,8c#,d#,d,c,b,c,b,a,2a,c,2a#.'
		  , hex = '024A3A695D85CDD195B185B991CC0408511CCAE82CC2EC32849A420BA0E30930A20AB0B30C208A0D20BA0A20B30BB0CA1269082E838C24C288268228388228388348344228365000';
		expect(Ringtone.fromRTTTL(rtttl).toHex()).toEqual(hex);
	});
});