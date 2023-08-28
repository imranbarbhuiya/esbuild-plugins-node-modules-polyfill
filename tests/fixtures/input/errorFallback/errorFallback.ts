import * as crypto from 'node:crypto';
import * as path from 'node:path';
import * as trace_events from 'node:trace_events';

// Ensure unused polyfills don't trigger the fallback
import { message } from './unusedPolyfill';

console.log(crypto);
console.log(trace_events);
console.log(path);

console.log(message);
