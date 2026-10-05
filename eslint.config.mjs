import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier, // ใส่เพิ่มไว้ด้านท้ายสุด
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    'coverage',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.agents/**/*',
    '.claude/**/*',
    '.cursor/**/*',
    '.devin/**/*',

    // เพิ่มการข้ามไฟล์ Auto-generated และ Migrations
    'migrations/**',
    'src/prisma/**',
    '**/*.d.ts',
  ]),
]);

export default eslintConfig;
