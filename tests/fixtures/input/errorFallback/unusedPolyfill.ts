export const message = 'Hello world';

// This polyfill has not been configured, so typically this would trigger the
// fallback. However, this will be tree-shaken away since it's not used, so we
// want to ensure that it doesn't trigger the fallback. The error message in the
// test should NOT contain a reference to this Node builtin.
export { default as assertStrict } from 'node:assert/strict';
