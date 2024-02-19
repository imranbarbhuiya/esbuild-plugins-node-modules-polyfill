export const escapeRegex = (str: string) => str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&').replace(/-/g, '\\x2d');

export const commonJsTemplate = ({ importPath }: { importPath: string }) => `export * from '${importPath}'`;

export const normalizeNodeBuiltinPath = (path: string) => path.replace(/^node:/, '').replace(/\/$/, '');
