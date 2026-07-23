/** Unit test cho logic thuần (lịch âm, dựng cây, GEDCOM/CSV) - kế thừa từ bản cũ */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        strict: true,
      },
    }],
  },
};
