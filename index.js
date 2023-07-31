'use strict';

const { utils } = require('stylelint');
const parseSelector = require('./utils/parseSelector');
const ruleUrl = require('./utils/ruleUrl');
const ruleMessages = require('./utils/ruleMessages');

const ruleName = 'kiforks/ng-avoid-global-styles';
const stylelint = require('stylelint');

const messages = ruleMessages(ruleName, {
	error: '"::ng-deep" at the first nesting level make all styles global, avoid it.',
});
const validateOptions = require('./utils/validateOptions');

const meta = {
	url: ruleUrl(ruleName),
};

module.exports = stylelint.createPlugin(ruleName, expectation => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: expectation,
			possible: ['always', 'never'],
		});

		if (!validOptions) {
			return;
		}

		function precedesParentSelector(current) {
			do {
				current = current.next();

				if (current.type === 'nesting') {
					return true;
				}
			} while (current.next());

			return false;
		}

		// attribute, class, combinator, comment, id, nesting, pseudo, root, selector, string, tag, or universal
		const chainingTypes = ['attribute', 'class', 'id', 'pseudo', 'tag', 'universal'];

		const interpolationRe = /#{.+?}$/;

		root.walkRules(rule => {
			parseSelector(rule.selector, result, rule, fullSelector => {
				let message;

				fullSelector.walk(node => {
					if (expectation === 'always' && node.parent.type === 'root' && node.selector.includes('::ng-deep')) {
						message = messages.error;
					}

					if (expectation === 'never') {
						if (rule.parent.type === 'root' || rule.parent.type === 'atrule') {
							return;
						}

						message = messages.rejected;
					}

					utils.report({
						ruleName,
						result,
						node: rule,
						message,
						index: node.sourceIndex,
					});
				});
			});
		});
	};
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
