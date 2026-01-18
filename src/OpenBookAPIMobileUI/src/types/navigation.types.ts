// Stack navigators param lists
export type BooksStackParamList = {
    BooksMain: undefined;
    BookDetail: {
        workKey: string;
        title?: string;
    };
};

export type AuthorsStackParamList = {
    AuthorsMain: undefined;
    AuthorDetail: {
        authorKey: string;
        name?: string;
    };
    BookDetail: {
        workKey: string;
        title?: string;
    };
};

export type HomeStackParamList = {
    HomeMain: undefined;
    BookDetail: {
        workKey: string;
        title?: string;
    };
};

export type SettingsStackParamList = {
    SettingsMain: undefined;
};

export type LibraryStackParamList = {
    LibraryMain: undefined;
    ListDetail: {
        listId: string;
        listName: string;
    };
    BookDetail: {
        workKey: string;
        title?: string;
    };
};

// Bottom Tab param list
export type RootTabParamList = {
    HomeTab: undefined;
    BooksTab: undefined;
    AuthorsTab: undefined;
    LibraryTab: undefined;
    SettingsTab: undefined;
};

// Legacy - keep for compatibility
export type RootStackParamList = {
    Home: undefined;
    BookDetail: {
        workKey: string;
        title?: string;
    };
    AuthorDetail: {
        authorKey: string;
        name?: string;
    };
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
