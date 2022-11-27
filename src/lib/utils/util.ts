export const escapeRegex = (str: string) => {
	return str.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d');
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
