export function matchRegx(valueToMatch: string, regxr: RegExp): boolean {
	const output = valueToMatch?.match(regxr)
	return output ? output[0].length === output.input?.length : false
}

export const regx = {
	name: /[A-Z a-z]*/,
	email: /[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}/,
	phoneNumber:
		/(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/,
	sha512: /\b([a-fA-F0-9]{128})\b/,
	sha256: /([a-f0-9]{64})/,
	number: /[0-9]*/,
	countryCode: /(\+?( |-|\.)?\d{1,3})/,
}

export function removeExtraSpaces(str: string) {
	return str?.trim()?.replace(/\s+/g, ' ')
}

export default regx
