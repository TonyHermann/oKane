import { configs, plugins } from "eslint-config-airbnb-extended";
import prettierConfig from "eslint-config-prettier/flat";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      ".brand-venv/**",
      "public/**",
    ],
  },
  plugins.importX,
  plugins.react,
  plugins.reactA11y,
  plugins.reactHooks,
  plugins.stylistic,
  plugins.typescriptEslint,
  ...configs.base.recommended,
  ...configs.react.recommended,
  ...configs.base.typescript,
  ...configs.react.typescript,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "import-x/prefer-default-export": "off",
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function" },
      ],
      "react/prop-types": "off",
      "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
      "import-x/extensions": "off",
      "react/require-default-props": "off",
      "no-param-reassign": [
        "error",
        { props: true, ignorePropertyModificationsFor: ["state", "draft"] },
      ],
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
    },
  },
  {
    // Preserve the previous lint contract: new airbnb-extended v3 and
    // react-hooks v7 checks stay off, and aliases use the legacy node resolver.
    settings: {
      "import-x/resolver-next": null,
      "import-x/resolver": {
        node: {
          extensions: [".mjs", ".js", ".jsx", ".json", ".ts", ".tsx", ".d.ts"],
        },
      },
    },
    rules: {
      "arrow-body-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "import-x/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "react-hooks/component-hook-factories": "off",
      "react-hooks/config": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/gating": "off",
      "react-hooks/globals": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/static-components": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts"],
    rules: {
      "import-x/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/setupTests.ts"],
    rules: {
      "import-x/no-extraneous-dependencies": [
        "error",
        { devDependencies: true },
      ],
    },
  },
  {
    files: ["src/core/errors/**/*.ts", "src/infraestructure/errors/**/*.ts"],
    rules: {
      "max-classes-per-file": "off",
    },
  },
  {
    files: ["src/shared/logger/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  prettierConfig,
];
