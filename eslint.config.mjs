// Minimal flat config: core recommended rules for plain JS, TS sources and
// generated/build output ignored until typescript-eslint is added.
export default [
  { ignores: ["dist/**", "node_modules/**", "convex/_generated/**"] },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {},
  },
];
