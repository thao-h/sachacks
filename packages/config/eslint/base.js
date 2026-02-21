/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "next/core-web-vitals"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
