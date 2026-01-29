module.exports = {
	types: [
		{ value: "feat", name: "feat:     A new feature" },
		{ value: "fix", name: "fix:      A bug fix" },
		{ value: "docs", name: "docs:     Documentation only changes" },
		{ value: "style", name: "style:    Code style changes (formatting, semicolons, etc)" },
		{ value: "refactor", name: "refactor: Code refactoring (no feature or bug fix)" },
		{ value: "perf", name: "perf:     Performance improvements" },
		{ value: "test", name: "test:     Adding or updating tests" },
		{ value: "build", name: "build:    Build system or external dependencies" },
		{ value: "ci", name: "ci:       CI/CD configuration changes" },
		{ value: "chore", name: "chore:    Other changes (maintenance, tooling)" },
		{ value: "revert", name: "revert:   Revert a previous commit" },
	],

	scopes: [
		{ name: "client" },
		{ name: "server" },
		{ name: "shared" },
		{ name: "ui" },
		{ name: "api" },
		{ name: "auth" },
		{ name: "queue" },
		{ name: "order" },
		{ name: "facility" },
		{ name: "config" },
		{ name: "deps" },
	],

	allowCustomScopes: true,
	allowBreakingChanges: ["feat", "fix"],
	skipQuestions: ["footer"],

	subjectLimit: 100,
	subjectSeparator: ": ",
	typePrefix: "",
	typeSuffix: "",

	messages: {
		type: "Select the type of change you're committing:",
		scope: "Select the scope of this change (optional):",
		customScope: "Enter custom scope:",
		subject: "Write a SHORT, IMPERATIVE description of the change:\n",
		body: 'Provide a LONGER description (optional). Use "|" to break new line:\n',
		breaking: "List any BREAKING CHANGES (optional):\n",
		confirmCommit: "Are you sure you want to proceed with the commit above?",
	},
};
