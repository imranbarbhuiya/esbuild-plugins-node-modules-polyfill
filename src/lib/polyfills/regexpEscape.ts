/**
 * https://github.com/sapphiredev/utilities/blob/main/packages/utilities/src/lib/regExpEsc.ts
 * @author The Sapphire Community and its contributors
 * @license MIT
 */
const REGEXPESC = /[$()*+./?[\\\]^{|}-]/g;

/**
 * Cleans a string from regex injection
 * @param str The string to clean
 * https://github.com/sapphiredev/utilities/blob/main/packages/utilities/src/lib/regExpEsc.ts
 * @author The Sapphire Community and its contributors
 * @license MIT
 */
export function regExpEsc(str: string): string {
	return str.replaceAll(REGEXPESC, '\\$&');
}
