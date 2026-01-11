# OpenBookAPI.MobileUI

React Native mobil uygulama - OpenBookAPI backend'ini kullanan kitap ve yazar arama uygulaması.

## 📱 Özellikler

- 📚 **Kitap Arama**: Başlık, yazar veya ISBN ile kitap arama
- ✍️ **Yazar Arama**: Yazar adıyla arama
- 📖 **Kitap Detayları**: Kapak görseli, açıklama, puanlama ve okuyucu istatistikleri
- 👤 **Yazar Detayları**: Biyografi, eserler listesi ve fotoğraflar
- 🌙 **Karanlık Mod Desteği**: Gece ve gündüz temaları
- 🔄 **Sayfalama**: Sonsuz kaydırma ile sonuç yükleme
- 🔍 **Birleşik Arama**: Tek ekranda kitap ve yazar arama

## 🛠️ Teknolojiler

- **React Native** 0.73.x
- **TypeScript** - Tip güvenliği için
- **React Navigation** 6.x - Navigasyon
- **React Native Paper** - Material Design 3 UI bileşenleri
- **Axios** - HTTP istekleri
- **Zustand** - State management (hazır)

## 📂 Proje Yapısı

```
src/
├── api/          # API servis katmanı
│   ├── client.ts       # Axios istemcisi
│   ├── bookService.ts  # Kitap API servisi
│   └── authorService.ts # Yazar API servisi
├── components/   # Yeniden kullanılabilir bileşenler
│   ├── BookCard.tsx
│   ├── AuthorCard.tsx
│   ├── SearchInput.tsx
│   ├── LoadingIndicator.tsx
│   ├── ErrorView.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
├── screens/      # Ekran bileşenleri
│   ├── HomeScreen.tsx
│   ├── BooksScreen.tsx
│   ├── AuthorsScreen.tsx
│   ├── BookDetailScreen.tsx
│   ├── AuthorDetailScreen.tsx
│   ├── SearchScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/   # Navigasyon yapılandırması
│   ├── RootNavigator.tsx
│   └── MainTabNavigator.tsx
├── hooks/        # Custom hooks
│   ├── useAsync.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
├── utils/        # Yardımcı fonksiyonlar
│   ├── formatters.ts
│   └── helpers.ts
├── types/        # TypeScript tipleri
│   ├── api.ts
│   └── navigation.ts
└── constants/    # Sabitler ve yapılandırma
    ├── config.ts
    └── theme.ts
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Android Studio (Android için)
- Xcode (iOS için - sadece macOS)

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   cd src/OpenBookAPI.MobileUI
   npm install
   ```

2. **Ortam değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyerek API_BASE_URL'i ayarlayın
   ```

3. **Android için çalıştırın:**
   ```bash
   npm run android
   ```

4. **iOS için çalıştırın (macOS):**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

## ⚙️ Yapılandırma

### API Bağlantısı

`.env` dosyasında API URL'ini ayarlayın:

```env
API_BASE_URL=http://localhost:5041/api
```

> **Not**: Android emülatörde localhost yerine `10.0.2.2` kullanın.

### AdMob Entegrasyonu

AdMob test ID'leri `.env.example` dosyasında mevcuttur. Yayın için gerçek ID'lerle değiştirin.

## 📱 Ekranlar

| Ekran | Açıklama |
|-------|----------|
| Home | Ana sayfa, hızlı arama ve popüler kategoriler |
| Books | Kitap arama ve listeleme |
| Authors | Yazar arama ve listeleme |
| Book Detail | Kitap detay sayfası |
| Author Detail | Yazar detay sayfası |
| Search | Birleşik arama ekranı |
| Settings | Uygulama ayarları |

## 🧪 Test

```bash
# Unit testleri çalıştır
npm test

# Coverage raporu
npm test -- --coverage
```

## 📦 Build

### Android APK

```bash
cd android
./gradlew assembleRelease
```

### Android App Bundle (Play Store için)

```bash
cd android
./gradlew bundleRelease
```

## 📝 Geliştirme Notları

- **FlatList** kullanın, ScrollView + map() kullanmayın
- **StyleSheet.create()** ile stiller oluşturun
- **useCallback** ve **useMemo** ile performans optimizasyonu yapın
- **Error Boundary** ile hata yönetimi
- **Accessibility** props'larını unutmayın

## 🔗 Bağlantılar

- [OpenBookAPI Backend](../OpenBookAPI.Api/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
