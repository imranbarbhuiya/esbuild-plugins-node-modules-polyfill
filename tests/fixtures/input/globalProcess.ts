/* eslint-disable no-restricted-globals, n/prefer-global/process */
console.log(process.version);

// Ensure that environment variables can still be injected via `define`
console.log(process.env.NODE_ENV);
