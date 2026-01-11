# GitHub Copilot Instructions - React Native Mobile Development

## Project Context

- Backend API already developed with Opus 4.5
- Building mobile app (Android first, iOS later)
- Using React Native with TypeScript
- VS Code as primary editor
- Target: Google Play Store publication with AdMob integration

## Code Style & Best Practices

### TypeScript Standards

- Always use TypeScript with strict mode
- Define interfaces for API responses and component props
- Use proper typing, avoid `any` unless absolutely necessary
- Prefer functional components with hooks

### React Native Conventions

- Use functional components with React Hooks
- Implement proper error boundaries
- Use async/await for API calls, not .then()
- Follow React Native best practices for performance
- Use FlatList for long lists, never ScrollView with .map()

### File Structure

```
src/
├── api/          # API service layer
├── components/   # Reusable components
├── screens/      # Screen components
├── navigation/   # Navigation configuration
├── hooks/        # Custom hooks
├── utils/        # Helper functions
├── types/        # TypeScript types/interfaces
└── constants/    # Constants and configuration
```

## API Integration Guidelines

### Service Layer Pattern

- Create dedicated service files in `src/api/`
- Use axios for HTTP requests
- Implement request/response interceptors
- Handle errors consistently
- Example structure:

```typescript
export const userService = {
  getUser: async (id: string) => {...},
  updateUser: async (data: UserData) => {...}
}
```

### Error Handling

- Always wrap API calls in try-catch
- Show user-friendly error messages
- Implement retry logic for network failures
- Use React Query or SWR for data fetching when appropriate

## Navigation

- Use React Navigation v6+
- Implement Stack Navigator for main flow
- Use Bottom Tabs for primary navigation
- Type-safe navigation with TypeScript

## State Management

- Start with React Context API for simple state
- Use Zustand for more complex state management
- Keep local state when possible
- Avoid prop drilling

## UI/UX Guidelines

### Component Libraries

- Prefer React Native Paper or NativeBase
- Use consistent design tokens (colors, spacing, typography)
- Implement dark mode support from the start

### Performance

- Use React.memo for expensive components
- Implement proper image optimization
- Use lazy loading where appropriate
- Monitor with React DevTools Profiler

## AdMob Integration

### Implementation Rules

- Initialize AdMob in App.tsx
- Never show ads on app launch
- Implement frequency caps (max 1 interstitial per 5 minutes)
- Use banner ads sparingly (bottom of screen only)
- Prefer rewarded ads for better UX
- Test with test ad units first

### Ad Placement Strategy

```typescript
// Good: Non-intrusive banner
<BannerAd unitId="..." size={BannerAdSize.BANNER} />

// Good: Rewarded for premium features
<RewardedAd unitId="..." onRewarded={grantPremiumFeature} />

// Bad: Too frequent interstitials
// Show interstitial only after meaningful user actions
```

## Code Generation Preferences

### When generating components:

1. Create TypeScript interfaces first
2. Include proper props typing
3. Add loading and error states
4. Include accessibility props (accessibilityLabel, etc.)
5. Add comments for complex logic only

### When generating API calls:

1. Include proper TypeScript types for request/response
2. Add error handling
3. Include loading states
4. Add request timeout configuration
5. Implement retry logic if needed

### When generating screens:

1. Include proper navigation typing
2. Add SafeAreaView wrapper
3. Implement pull-to-refresh where appropriate
4. Add loading skeletons
5. Handle empty states

## Platform-Specific Code

- Use `Platform.select()` for platform differences
- Keep platform-specific code minimal
- Test on both Android emulator and physical device
- Use `Platform.OS === 'android'` checks when needed

## Security Best Practices

- Never hardcode API keys or secrets
- Use react-native-config for environment variables
- Implement proper token storage (AsyncStorage or Keychain)
- Validate all user inputs
- Use HTTPS for all API calls

## Testing Approach

- Write tests for business logic and utilities
- Use Jest for unit tests
- Use React Native Testing Library for component tests
- Test API integration with mock data
- Manual testing on physical devices is crucial

## Build & Deployment

### Android Specific

- Generate signed APK/AAB for release
- Use proper versioning (versionCode and versionName)
- Optimize APK size (enable ProGuard/R8)
- Test on multiple screen sizes
- Follow Google Play Store guidelines

## Performance Optimization

- Use Hermes engine (enabled by default)
- Implement code splitting where possible
- Optimize images (use WebP format)
- Minimize bridge communication
- Use native modules for intensive tasks

## Common Pitfalls to Avoid

❌ Don't use inline styles excessively
❌ Don't forget to unsubscribe from listeners
❌ Don't use console.log in production
❌ Don't ignore memory leaks
❌ Don't skip error boundaries
❌ Don't overuse Context API for everything

✅ Do use StyleSheet.create()
✅ Do cleanup in useEffect
✅ Do implement proper logging (react-native-logs)
✅ Do use profiling tools
✅ Do implement error boundaries
✅ Do choose appropriate state management

## When suggesting solutions:

1. **Prioritize simplicity** - Start with the simplest solution that works
2. **Consider mobile constraints** - Battery, network, memory
3. **Think cross-platform** - Code should work on iOS too (for future)
4. **Focus on UX** - Mobile users expect smooth, fast interactions
5. **Be production-ready** - Include error handling, loading states, edge cases

## Code Comments

- Add comments only for complex business logic
- Use JSDoc for functions and components
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

## Git Commit Messages

- Use conventional commits format
- Examples:
  - `feat: add user profile screen`
  - `fix: resolve crash on logout`
  - `refactor: optimize FlatList rendering`

## Additional Notes

- Assume latest stable versions of all dependencies
- Prioritize developer experience and maintainability
- When in doubt, follow official React Native documentation
- Consider bundle size impact of new dependencies
- Always think about offline functionality

---

**Model Preference:** Claude Opus 4.5 for complex problem-solving and architectural decisions
**Focus:** Clean, maintainable, production-ready code for Android mobile app
**Goal:** Fast development with GitHub Copilot while maintaining code quality
