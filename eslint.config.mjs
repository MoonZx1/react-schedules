
export default [
  {
    ignores: ["node_modules/**"], // ไฟล์หรือโฟลเดอร์ที่ต้องการยกเว้น
    files: ["src/**/*.ts", "src/**/*.tsx"], // ระบุไฟล์ที่ต้องการตรวจสอบ
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: require("eslint-plugin-react"),
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
