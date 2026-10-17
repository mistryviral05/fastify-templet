/** @type {import("@commitlint/types").UserConfig} */
export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "feat",
                "fix",
                "docs",
                "style",
                "refactor",
                "perf",
                "test",
                "build",
                "ci",
                "chore",
                "revert",
            ],
        ],
        "type-empty": [2, "never"],
        "subject-empty": [2, "never"],
        "subject-case": [2, "always", "lower-case"],
        "subject-full-stop": [2, "never", "."],
        "header-max-length": [2, "always", 100],
        "body-leading-blank": [2, "always"],
        "footer-leading-blank": [2, "always"],
    },
};
