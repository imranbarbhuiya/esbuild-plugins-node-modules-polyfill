// eslint-disable-next-line unicorn/prefer-node-protocol
import { inspect } from 'util';

const data = {
	name: 'esbuild',
};

const result = inspect(data, { depth: 0, colors: true });

console.log(result);
