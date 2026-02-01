import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listBooksCollection } from '../database';

interface ListCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  cardWidth: number;
}

export const ListCard: React.FC<ListCardProps> = ({
  id,
  name,
  icon,
  color,
  isSystem,
  onPress,
  onLongPress,
  cardWidth,
}) => {
  const [bookCount, setBookCount] = useState<number>(0);

  // Calculate dynamic styles based on cardWidth
  const dynamicStyles = useMemo(
    () => ({
      container: {
        width: cardWidth,
      },
    }),
    [cardWidth],
  );

  useEffect(() => {
    const subscription = listBooksCollection
      .query(Q.where('list_id', id))
      .observeCount()
      .subscribe({
        next: count => setBookCount(count),
        error: err => console.error('Error counting books:', err),
      });

    return () => subscription.unsubscribe();
  }, [id]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        dynamicStyles.container,
        { borderLeftColor: color },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityLabel={`${name} list, ${bookCount} books`}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>
          {bookCount} {bookCount === 1 ? 'book' : 'books'}
        </Text>
      </View>
      {isSystem && (
        <View style={styles.systemBadge}>
          <Text style={styles.systemBadgeText}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#888',
  },
  systemBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  systemBadgeText: {
    fontSize: 10,
  },
});
