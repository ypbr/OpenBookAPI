import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookSummary } from '../types/api.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface BookCardProps {
  book: BookSummary;
  onPress: (book: BookSummary) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
      accessibilityLabel={`Book: ${book.title}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        {book.authors && book.authors.length > 0 && (
          <Text style={styles.author} numberOfLines={1}>
            {book.authors.join(', ')}
          </Text>
        )}
        {book.firstPublishYear && (
          <Text style={styles.year}>{book.firstPublishYear}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  placeholderText: {
    fontSize: 48,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  year: {
    fontSize: 11,
    color: '#999',
  },
});
