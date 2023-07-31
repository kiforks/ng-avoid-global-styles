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

		// attribute, class, combinator, comment, id, nesting, pseudo, root, selector, string, tag, or universal
		const chainingTypes = ['attribute', 'class', 'id', 'pseudo', 'tag', 'universal'];

		const interpolationRe = /#{.+?}$/;

		root.walkRules(rule => {
			const isFristNestedLevel = rule.parent.type === 'root';
			const isNgDeep = rule.selector.includes('::ng-deep');

			if (expectation === 'always' && isFristNestedLevel && isNgDeep) {
				utils.report({
					ruleName,
					result,
					node: rule,
					message: messages.error,
				});
			}
		});
	};
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
