import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthorSummary } from '../types/api.types';

interface AuthorCardProps {
  author: AuthorSummary;
  onPress: (author: AuthorSummary) => void;
  cardWidth?: number;
  avatarSize?: number;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  onPress,
  cardWidth,
  avatarSize = 60,
}) => {
  // Calculate dynamic styles based on props
  const dynamicStyles = useMemo(
    () => ({
      container: cardWidth ? { width: cardWidth } : {},
      avatarContainer: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
      },
    }),
    [cardWidth, avatarSize],
  );

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container]}
      onPress={() => onPress(author)}
      activeOpacity={0.7}
      accessibilityLabel={`Author: ${author.name}`}
      accessibilityRole="button"
    >
      <View style={[styles.avatarContainer, dynamicStyles.avatarContainer]}>
        {author.photoUrl ? (
          <Image
            source={{ uri: author.photoUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>👤</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {author.name}
        </Text>
        {author.workCount !== undefined && (
          <Text style={styles.workCount}>
            {author.workCount} {author.workCount === 1 ? 'work' : 'works'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  placeholderText: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  workCount: {
    fontSize: 13,
    color: '#666',
  },
});
