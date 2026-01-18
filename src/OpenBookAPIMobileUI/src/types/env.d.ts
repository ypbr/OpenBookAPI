// Type definitions for react-native-config
declare module 'react-native-config' {
    export interface NativeConfig {
        ENV_NAME: 'development' | 'pre' | 'production';
        API_BASE_URL: string;
        API_TIMEOUT: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
