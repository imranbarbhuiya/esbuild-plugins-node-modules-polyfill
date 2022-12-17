import { regExpEsc } from './regexpEscape.js';

/**
 * String.prototype.replaceAll() polyfill
 * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
 * @author Chris Ferdinandi
 * @license MIT
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!String.prototype.replaceAll) {
	// eslint-disable-next-line no-extend-native
	String.prototype.replaceAll = function replaceAll(
		str: RegExp | string,
		newStr: string | ((substring: string, ...args: any[]) => string),
	): string {
		// If a regex pattern
		if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
			// @ts-expect-error newStr can be both a string or a function returning a string
			return this.replace(str, newStr);
		}

		// If a string
		// @ts-expect-error newStr can be both a string or a function returning a string
		return this.replaceAll(new RegExp(regExpEsc(str), 'g'), newStr);
	};
}
