/** @type {import('jest').Config} */
module.exports = {
  projects: [
    /**
     * "unit" project: pure TypeScript logic — services, API client, utilities.
     * Uses the Node environment (no React Native runtime needed).
     */
    {
      displayName: "unit",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/src/services/__tests__/**/*.test.ts",
        "<rootDir>/src/api/__tests__/**/*.test.ts",
        "<rootDir>/src/stores/__tests__/**/*.test.ts",
        "<rootDir>/src/utils/__tests__/**/*.test.ts",
      ],
      transform: {
        "^.+\\.(js|ts|tsx)$": [
          "babel-jest",
          { presets: ["babel-preset-expo"] },
        ],
      },
      transformIgnorePatterns: [
        "node_modules/(?!(axios|expo|@expo|@react-native-async-storage)/)",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.unit.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    /**
     * "native" project: React Native components and hooks.
     * Uses jest-expo preset with the full RN environment.
     */
    {
      displayName: "native",
      preset: "jest-expo",
      setupFiles: ["<rootDir>/jest.setup.native.ts"],
      testMatch: [
        "<rootDir>/src/components/__tests__/**/*.test.tsx",
        "<rootDir>/src/hooks/__tests__/**/*.test.ts",
        "<rootDir>/app/**/__tests__/**/*.test.tsx",
      ],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg)",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  ],
};
