// eslint-disable-next-line unicorn/prefer-node-protocol
import { join } from 'path';
// eslint-disable-next-line unicorn/prefer-node-protocol
import { inspect } from 'util';

const result = inspect({ path: join('/', 'tmp') }, { depth: 0, colors: true });

console.log(result);
