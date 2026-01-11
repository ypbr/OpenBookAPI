import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorService } from '../api';
import { ErrorView, LoadingIndicator } from '../components';
import { colors, spacing } from '../constants/theme';
import type { AuthorDetail, WorkSummary } from '../types/api';
import type { RootStackScreenProps } from '../types/navigation';
import { getInitials } from '../utils/formatters';

type RouteProps = RootStackScreenProps<'AuthorDetail'>['route'];

/**
 * Author detail screen - shows full author information
 */
export const AuthorDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const {authorKey} = route.params;

  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authorService.getAuthorDetail(authorKey);
      setAuthor(result);

      // Also fetch works
      setWorksLoading(true);
      const worksResult = await authorService.getAuthorWorks({
        authorKey,
        page: 1,
        limit: 10,
      });
      setWorks(worksResult.works);
    } catch (err) {
      setError('Failed to load author details. Please try again.');
      console.error('Error fetching author details:', err);
    } finally {
      setLoading(false);
      setWorksLoading(false);
    }
  }, [authorKey]);

  useEffect(() => {
    fetchAuthorDetail();
  }, [fetchAuthorDetail]);

  const handleWorkPress = useCallback(
    (workKey: string) => {
      navigation.navigate('BookDetail', {workKey});
    },
    [navigation],
  );

  if (loading) {
    return <LoadingIndicator fullScreen message="Loading author details..." />;
  }

  if (error || !author) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView
          message={error || 'Author not found'}
          onRetry={fetchAuthorDetail}
        />
      </SafeAreaView>
    );
  }

  const initials = getInitials(author.name);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          {author.photos && author.photos.length > 0 ? (
            <Image
              source={{uri: author.photos[0]}}
              style={styles.photo}
              resizeMode="cover"
              accessibilityLabel={`Photo of ${author.name}`}
            />
          ) : (
            <Avatar.Text
              size={120}
              label={initials}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {author.name}
          </Text>

          {/* Birth/Death Dates */}
          <View style={styles.dates}>
            {author.birthDate && (
              <Text variant="bodyMedium" style={styles.dateText}>
                Born: {author.birthDate}
              </Text>
            )}
            {author.deathDate && (
              <Text variant="bodyMedium" style={styles.dateText}>
                Died: {author.deathDate}
              </Text>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Biography */}
        {author.bio && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Biography
            </Text>
            <Text variant="bodyMedium" style={styles.bio}>
              {author.bio}
            </Text>
          </View>
        )}

        {/* Alternate Names */}
        {author.alternateNames && author.alternateNames.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Also Known As
            </Text>
            <Text variant="bodyMedium" style={styles.alternateNames}>
              {author.alternateNames.join(', ')}
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Works Section */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Works
          </Text>

          {worksLoading ? (
            <LoadingIndicator size="small" message="Loading works..." />
          ) : works.length === 0 ? (
            <Text variant="bodyMedium" style={styles.noWorks}>
              No works found for this author.
            </Text>
          ) : (
            <View style={styles.worksList}>
              {works.map(work => (
                <Button
                  key={work.workKey}
                  mode="outlined"
                  style={styles.workButton}
                  contentStyle={styles.workButtonContent}
                  onPress={() => handleWorkPress(work.workKey)}>
                  <View style={styles.workItem}>
                    <Text
                      variant="bodyMedium"
                      style={styles.workTitle}
                      numberOfLines={1}>
                      {work.title}
                    </Text>
                    {work.firstPublishYear && (
                      <Text variant="bodySmall" style={styles.workYear}>
                        ({work.firstPublishYear})
                      </Text>
                    )}
                  </View>
                </Button>
              ))}
            </View>
          )}
        </View>

        {/* Links */}
        {author.links && author.links.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              External Links
            </Text>
            {author.links.map((link, index) => (
              <Text key={index} variant="bodyMedium" style={styles.link}>
                • {link.title}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceVariant,
  },
  avatar: {
    backgroundColor: colors.primaryContainer,
  },
  avatarLabel: {
    color: colors.onPrimaryContainer,
    fontSize: 40,
  },
  name: {
    color: colors.onSurface,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  dates: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  dateText: {
    color: colors.onSurfaceVariant,
  },
  divider: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  bio: {
    color: colors.onSurface,
    lineHeight: 24,
  },
  alternateNames: {
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  noWorks: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  worksList: {
    gap: spacing.sm,
  },
  workButton: {
    borderColor: colors.outline,
  },
  workButtonContent: {
    justifyContent: 'flex-start',
  },
  workItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workTitle: {
    color: colors.onSurface,
    flex: 1,
  },
  workYear: {
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  link: {
    color: colors.primary,
    marginVertical: spacing.xs,
  },
});
