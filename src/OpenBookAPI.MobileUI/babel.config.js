module.exports = {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./src'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    '@api': './src/api',
                    '@components': './src/components',
                    '@screens': './src/screens',
                    '@navigation': './src/navigation',
                    '@hooks': './src/hooks',
                    '@utils': './src/utils',
                    '@types': './src/types',
                    '@constants': './src/constants',
                },
            },
        ],
    ],
};
