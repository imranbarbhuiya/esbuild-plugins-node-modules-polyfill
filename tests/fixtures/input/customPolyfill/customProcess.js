// Custom process polyfill for testing
const customProcess = {
	env: {},
	version: 'custom-v1.0.0',
	versions: {},
	platform: 'browser',
	release: {},
	stdout: {
		write: (data) => console.log(data),
	},
};

export default customProcess;
