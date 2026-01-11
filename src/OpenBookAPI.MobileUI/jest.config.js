module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@screens/(.*)$': '<rootDir>/src/screens/$1',
        '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-vector-icons|react-native-safe-area-context|react-native-screens|@react-navigation)/)',
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
};
