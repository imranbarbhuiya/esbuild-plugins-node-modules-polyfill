export const escapeRegex = (str: string) => {
	return str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&').replace(/-/g, '\\x2d');
};

export const commonJsTemplate = ({ importPath }: { importPath: string }) => {
	return `export * from '${importPath}'`;
};

export const normalizeNodeBuiltinPath = (path: string) => {
	return path.replace(/^node:/, '').replace(/\/$/, '');
};
