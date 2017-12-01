const karmaConfig = require('./karma.conf.js');
const lernaJson = require('./lerna.json');

module.exports = function(config) {
	karmaConfig(config);

	config.plugins.push('karma-coverage');

	config.set({
		browserify: {
			debug: true,
			transform: [
				[
					'babelify',
					{
						plugins: ['istanbul'],
						presets: ['env'],
					},
				],
			],
			insertGlobalVars: {
				METAL_VERSION: function() {
					return '\'' + lernaJson.version + '\'';
				},
			},
		},

		coverageReporter: {
			reporters: [
				{
					type: 'lcov',
					subdir: 'lcov',
				},
				{
					type: 'text-summary',
				},
			],
		},

		reporters: ['coverage', 'progress'],
	});
};
