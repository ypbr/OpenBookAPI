import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../api';
import { AddToListModal, ErrorView, LoadingIndicator } from '../components';
import { BookDetail } from '../types/api.types';

interface BookDetailScreenProps {
  route: {
    params: {
      workKey: string;
      title?: string;
    };
  };
}

export const BookDetailScreen: React.FC<BookDetailScreenProps> = ({
  route,
}) => {
  const { workKey } = route.params;
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addToListModalVisible, setAddToListModalVisible] = useState(false);

  const fetchBookDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookService.getByKey(workKey);
      setBook(result);
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [workKey]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading book details..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView message={error} onRetry={fetchBookDetail} />
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView message="Book not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>
          {book.subtitle && (
            <Text style={styles.subtitle}>{book.subtitle}</Text>
          )}

          {book.authors && book.authors.length > 0 && (
            <Text style={styles.authors}>
              by {book.authors.map(a => a.name || 'Unknown').join(', ')}
            </Text>
          )}

          {book.firstPublishDate && (
            <Text style={styles.publishDate}>
              First published: {book.firstPublishDate}
            </Text>
          )}

          {book.ratingsInfo && book.ratingsInfo.count > 0 && (
            <View style={styles.ratingsContainer}>
              <Text style={styles.rating}>
                ⭐ {book.ratingsInfo.average.toFixed(1)} (
                {book.ratingsInfo.count} ratings)
              </Text>
            </View>
          )}
        </View>

        {book.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        )}

        {book.subjects && book.subjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagsContainer}>
              {book.subjects.slice(0, 10).map((subject, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {book.bookshelvesInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reader Stats</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {book.bookshelvesInfo.wantToRead}
                </Text>
                <Text style={styles.statLabel}>Want to Read</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {book.bookshelvesInfo.currentlyReading}
                </Text>
                <Text style={styles.statLabel}>Reading</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {book.bookshelvesInfo.alreadyRead}
                </Text>
                <Text style={styles.statLabel}>Read</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - Add to List */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddToListModalVisible(true)}
        accessibilityLabel="Add to list"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>📚</Text>
      </TouchableOpacity>

      {/* Add to List Modal */}
      <AddToListModal
        visible={addToListModalVisible}
        onClose={() => setAddToListModalVisible(false)}
        workKey={book.key}
        title={book.title}
        coverUrl={book.coverUrl || null}
        authorNames={book.authors?.map(a => a.name || 'Unknown') || []}
      />
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
  coverImage: {
    width: 180,
    height: 270,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderCover: {
    width: 180,
    height: 270,
    borderRadius: 8,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  authors: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  publishDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  ratingsContainer: {
    marginTop: 8,
  },
  rating: {
    fontSize: 16,
    color: '#f5a623',
    fontWeight: '600',
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
  description: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});
