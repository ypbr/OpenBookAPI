import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authorService } from '../api';
import { ErrorView, LoadingIndicator } from '../components';
import { AuthorDetail, AuthorWorks, BookSummary } from '../types/api.types';

interface AuthorDetailScreenProps {
  route: {
    params: {
      authorKey: string;
      name?: string;
    };
  };
  navigation: any;
}

export const AuthorDetailScreen: React.FC<AuthorDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { authorKey } = route.params;
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [works, setWorks] = useState<AuthorWorks | null>(null);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWorks, setShowWorks] = useState(false);

  const fetchAuthorDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authorService.getByAuthorKey(authorKey);
      setAuthor(result);
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to load author details');
    } finally {
      setLoading(false);
    }
  }, [authorKey]);

  const fetchAuthorWorks = useCallback(async () => {
    try {
      setWorksLoading(true);
      const result = await authorService.getWorks(authorKey, {
        page: 1,
        limit: 10,
      });
      setWorks(result);
      setShowWorks(true);
    } catch (err: any) {
      console.error('Failed to load works:', err);
    } finally {
      setWorksLoading(false);
    }
  }, [authorKey]);

  useEffect(() => {
    fetchAuthorDetail();
  }, [fetchAuthorDetail]);

  const handleBookPress = useCallback(
    (book: BookSummary) => {
      navigation.navigate('BookDetail', {
        workKey: book.workKey,
        title: book.title,
      });
    },
    [navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading author details..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView message={error} onRetry={fetchAuthorDetail} />
      </SafeAreaView>
    );
  }

  if (!author) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView message="Author not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {author.photoUrl ? (
            <Image
              source={{ uri: author.photoUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.name}>{author.name}</Text>
          {author.personalName && author.personalName !== author.name && (
            <Text style={styles.personalName}>{author.personalName}</Text>
          )}

          {(author.birthDate || author.deathDate) && (
            <Text style={styles.dates}>
              {author.birthDate || '?'} - {author.deathDate || 'Present'}
            </Text>
          )}
        </View>

        {author.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biography</Text>
            <Text style={styles.bio}>{author.bio}</Text>
          </View>
        )}

        {author.alternateNames && author.alternateNames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Also Known As</Text>
            <View style={styles.tagsContainer}>
              {author.alternateNames.slice(0, 5).map((name, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.worksButton}
            onPress={fetchAuthorWorks}
            disabled={worksLoading}
          >
            <Text style={styles.worksButtonText}>
              {worksLoading
                ? 'Loading...'
                : showWorks
                ? 'Refresh Works'
                : 'Show Works'}
            </Text>
          </TouchableOpacity>

          {showWorks && works && works.works.length > 0 && (
            <View style={styles.worksContainer}>
              <Text style={styles.worksTitle}>
                Works ({works.totalResults})
              </Text>
              {works.works.map((book, index) => (
                <TouchableOpacity
                  key={`${book.workKey}-${index}`}
                  style={styles.workItem}
                  onPress={() => handleBookPress(book)}
                >
                  <Text style={styles.workTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  {book.firstPublishYear && (
                    <Text style={styles.workYear}>{book.firstPublishYear}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8f8f8',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  infoSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  personalName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dates: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#555',
  },
  worksButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  worksButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  worksContainer: {
    marginTop: 8,
  },
  worksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  workItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workTitle: {
    flex: 1,
    fontSize: 15,
    color: '#007AFF',
    marginRight: 8,
  },
  workYear: {
    fontSize: 13,
    color: '#888',
  },
});
