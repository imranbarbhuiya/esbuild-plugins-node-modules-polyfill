/* eslint-disable unicorn/prefer-string-replace-all -- node v14 doesn't supports string.replaceAll*/
import { polyfillContent, polyfillPath } from 'modern-node-polyfills';

export const escapeRegex = (str: string) => {
	return str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&').replace(/-/g, '\\x2d');
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

const normalizeNodeBuiltinPath = (path: string) => {
	return path.replace(/^node:/, '').replace(/\/$/, '');
};

const polyfillPathCache: Map<string, Promise<string>> = new Map();
export const getCachedPolyfillPath = (_importPath: string): Promise<string> => {
	const normalizedImportPath = normalizeNodeBuiltinPath(_importPath);

	const cachedPromise = polyfillPathCache.get(normalizedImportPath);
	if (cachedPromise) {
		return cachedPromise;
	}

	const promise = polyfillPath(normalizedImportPath);
	polyfillPathCache.set(normalizedImportPath, promise);
	return promise;
};

const polyfillContentAndTransform = async (importPath: string) => {
	const content = await polyfillContent(importPath);
	return content.replace(/eval\(/g, '(0,eval)(');
};

const polyfillContentCache: Map<string, Promise<string>> = new Map();
export const getCachedPolyfillContent = (_importPath: string): Promise<string> => {
	const normalizedImportPath = normalizeNodeBuiltinPath(_importPath);

	const cachedPromise = polyfillContentCache.get(normalizedImportPath);
	if (cachedPromise) {
		return cachedPromise;
	}

	const promise = polyfillContentAndTransform(normalizedImportPath);
	polyfillContentCache.set(normalizedImportPath, promise);
	return promise;
};
