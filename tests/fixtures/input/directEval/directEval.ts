// eslint-disable-next-line unicorn/prefer-node-protocol
import { getHashes } from 'crypto';
import { createContext, runInContext } from 'node:vm';

const result = getHashes();

console.log(result);

const contextObject = { a: 1 };
createContext(contextObject);

const vmResult = runInContext(`a + 1;`, contextObject);

console.log(vmResult);
