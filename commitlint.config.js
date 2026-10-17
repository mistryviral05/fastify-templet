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
        /* Off, so identifiers like HooksRegister can appear in a subject */
        "subject-case": [0],
        "subject-full-stop": [2, "never", "."],
        "header-max-length": [2, "always", 100],
        "body-leading-blank": [2, "always"],
        "footer-leading-blank": [2, "always"],
    },
};
