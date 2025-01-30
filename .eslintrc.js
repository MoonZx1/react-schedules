module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // ใช้ eslint-plugin-prettier และเปิดใช้งาน plugin:prettier
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest', // ใช้เวอร์ชันล่าสุดของ ECMAScript
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error', // แสดงข้อผิดพลาดเมื่อ Prettier ละเมิดรูปแบบ
    'react/react-in-jsx-scope': 'off', // ไม่ต้องใช้ `React` ใน Scope สำหรับ JSX (React 17+)
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // เตือนสำหรับตัวแปรที่ไม่ได้ใช้
    '@typescript-eslint/explicit-module-boundary-types': 'off', // ไม่บังคับการกำหนด type ของฟังก์ชัน
    'react/prop-types': 'off', // ปิดการตรวจสอบ prop-types เนื่องจากใช้ TypeScript
  },
  settings: {
    react: {
      version: 'detect', // ตรวจสอบเวอร์ชัน React อัตโนมัติ
    },
  },
};
