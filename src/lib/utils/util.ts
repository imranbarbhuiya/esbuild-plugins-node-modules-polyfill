/* eslint-disable unicorn/prefer-string-replace-all -- node v14 doesn't supports string.replaceAll*/
export const escapeRegex = (str: string) => {
	return str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&').replace(/-/g, '\\x2d');
};

export const removeEndingSlash = (str: string) => {
	return str.replace(/\/$/, '');
};

export const commonJsTemplate = ({ importPath }: { importPath: string }) => {
	return `
const polyfill = require('${importPath}')
if (polyfill && polyfill.default) {
    module.exports = polyfill.default
    for (let k in polyfill) {
        module.exports[k] = polyfill[k]
    }
} else if (polyfill)  {
    module.exports = polyfill
}
`;
};
