// Test file that uses process module
import process from 'process';

console.log(process.version);
console.log(process.platform);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (process.stdout && process.stdout.write) {
	process.stdout.write('Hello from custom process!');
}
