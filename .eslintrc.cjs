module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb",
    "airbnb-typescript",
    "airbnb/hooks",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.app.json", ".tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off", // Ya no es necesario importar React en cada archivo
    "import/prefer-default-export": "off", // En Clean Architecture usamos muchos exports nombrados
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
      },
    ],
    "react/prop-types": "off",
    "no-unused-vars": "off", // Desactivamos la base para usar la de TS
    "@typescript-eslint/no-unused-vars": ["error"],
    "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
    "import/extensions": "off", // Evita errores al importar archivos .ts/.tsx
    "@typescript-eslint/lines-between-class-members": "error",
    "@typescript-eslint/no-throw-literal": "error",
    "react/require-default-props": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      files: [".eslintrc.cjs", "vite.config.ts"],
      parserOptions: {
        project: null, // Esto desactiva el requisito de tsconfig para estos archivos
      },
    },
  ],
};
