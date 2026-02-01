import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ReadingList, readingListsCollection, SavedBook } from '../database';
import { libraryService } from '../services/libraryService';
import { SystemListId } from '../types/library.types';
import { ReadingProgressModal } from './ReadingProgressModal';

interface AddToListModalProps {
  visible: boolean;
  onClose: () => void;
  workKey: string;
  title: string;
  coverUrl: string | null;
  authorNames: string[];
}

interface ListWithStatus {
  list: ReadingList;
  isSelected: boolean;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  visible,
  onClose,
  workKey,
  title,
  coverUrl,
  authorNames,
}) => {
  const [listsWithStatus, setListsWithStatus] = useState<ListWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(
    new Map(),
  );
  // Reading progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [savedBookForProgress, setSavedBookForProgress] =
    useState<SavedBook | null>(null);

  // Load lists and their status when modal opens
  useEffect(() => {
    if (!visible) {
      setPendingChanges(new Map());
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Get all lists
        const lists = await readingListsCollection
          .query(Q.sortBy('sort_order', Q.asc))
          .fetch();

        // Get which lists contain this book (by workKey)
        const savedBook = await libraryService.getBookByWorkKey(workKey);
        let selectedListIds: Set<string> = new Set();

        if (savedBook) {
          const listsForBook = await libraryService.getListsForBook(
            savedBook.id,
          );
          selectedListIds = new Set(listsForBook.map(l => l.id));
        }

        const result: ListWithStatus[] = lists.map(list => ({
          list,
          isSelected: selectedListIds.has(list.id),
        }));

        setListsWithStatus(result);
      } catch (err) {
        console.error('Error loading lists:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, workKey]);

  const toggleList = (listId: string, currentStatus: boolean) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      const originalStatus =
        listsWithStatus.find(l => l.list.id === listId)?.isSelected ?? false;
      const newStatus = !currentStatus;

      // If returning to original state, remove from pending changes
      if (newStatus === originalStatus) {
        newMap.delete(listId);
      } else {
        newMap.set(listId, newStatus);
      }

      return newMap;
    });
  };

  const getEffectiveStatus = (listId: string): boolean => {
    if (pendingChanges.has(listId)) {
      return pendingChanges.get(listId) as boolean;
    }
    return listsWithStatus.find(l => l.list.id === listId)?.isSelected ?? false;
  };

  const handleSave = async () => {
    if (pendingChanges.size === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const bookData = {
        workKey,
        title,
        coverUrl: coverUrl ?? undefined,
        authorNames,
      };

      // Check if "Reading" list is being added (not already selected)
      const isAddingToReadingList =
        pendingChanges.get(SystemListId.READING) === true;
      const wasAlreadyInReadingList =
        listsWithStatus.find(l => l.list.id === SystemListId.READING)
          ?.isSelected ?? false;

      for (const [listId, shouldAdd] of pendingChanges) {
        if (shouldAdd) {
          // Add book to list
          await libraryService.addBookToList(bookData, listId);
        } else {
          // Remove book from list - need to get the book ID first
          const savedBook = await libraryService.getBookByWorkKey(workKey);
          if (savedBook) {
            await libraryService.removeBookFromList(savedBook.id, listId);
          }
        }
      }

      // If adding to "Reading" list for the first time, show progress modal
      if (isAddingToReadingList && !wasAlreadyInReadingList) {
        const savedBook = await libraryService.getBookByWorkKey(workKey);
        if (savedBook) {
          setSavedBookForProgress(savedBook);
          setShowProgressModal(true);
          // Don't close yet, wait for progress modal
          setSaving(false);
          return;
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving list changes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleProgressModalClose = () => {
    setShowProgressModal(false);
    setSavedBookForProgress(null);
    onClose();
  };

  const hasChanges = pendingChanges.size > 0;

  return (
    <>
      <Modal
        visible={visible && !showProgressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add to List</Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={saving}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bookTitle} numberOfLines={2}>
              {title}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading lists...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
              >
                {listsWithStatus.map(({ list }) => {
                  const isSelected = getEffectiveStatus(list.id);
                  const hasChanged = pendingChanges.has(list.id);

                  return (
                    <TouchableOpacity
                      key={list.id}
                      style={[
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                        hasChanged && styles.listItemChanged,
                      ]}
                      onPress={() => toggleList(list.id, isSelected)}
                      disabled={saving}
                      accessibilityLabel={`${list.name}, ${
                        isSelected ? 'selected' : 'not selected'
                      }`}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                    >
                      <View
                        style={[
                          styles.listIcon,
                          { backgroundColor: list.color + '20' },
                        ]}
                      >
                        <Text style={styles.listIconText}>{list.icon}</Text>
                      </View>
                      <Text style={styles.listName}>{list.name}</Text>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={saving}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!hasChanges || saving) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!hasChanges || saving}
                accessibilityLabel="Save"
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {hasChanges ? 'Save' : 'Done'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reading Progress Modal - shown when adding to "Reading" list */}
      <ReadingProgressModal
        visible={showProgressModal}
        onClose={handleProgressModalClose}
        book={savedBookForProgress}
        isInitialSetup={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#888',
    padding: 8,
  },
  bookTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  listContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  listItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  listItemChanged: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listIconText: {
    fontSize: 16,
  },
  listName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
