#!/bin/sh

echo "Usage: $0 <logo.otb>"
echo
echo "The logo file must be compatible, eg. a 72x14 OTA bitmap (starts with hex 00 48 0E 01)."
echo "You must have a file called .secrets that defines variables api_key, api_secret, to."
echo

udh=06050415820000
body="$(xxd -p -c 500 $1)"
mccmnc="42f450"

# Elisa: MCC 244, MNC 05
# both are little-endian and MCC is padded with F, so MCC 123 and MNC 45 would yield 21F354

source .secrets

echo "https://rest.nexmo.com/sms/json?from=dancek&type=binary&udh=${udh}&body=${mccmnc}${body}&to=${to}&api_key=${api_key}&api_secret=${api_secret}"
