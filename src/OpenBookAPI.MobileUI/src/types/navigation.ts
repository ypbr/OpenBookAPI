import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
    CompositeScreenProps,
    NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack Navigator params
export type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
    BookDetail: { workKey: string };
    AuthorDetail: { authorKey: string };
    Search: { query?: string };
};

// Main Tab Navigator params
export type MainTabParamList = {
    Home: undefined;
    Books: undefined;
    Authors: undefined;
    Settings: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<MainTabParamList, T>,
        RootStackScreenProps<keyof RootStackParamList>
    >;

// Utility type for useNavigation hook
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
