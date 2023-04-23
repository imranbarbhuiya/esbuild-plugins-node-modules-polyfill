import { inspect } from 'node:util';

const data = {
	name: 'esbuild',
};

const result = inspect(data, { depth: 0, colors: true });

console.log(result);
