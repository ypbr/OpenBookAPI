import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { bookService } from '../api';
import { SavedBook } from '../database';
import { libraryService } from '../services/libraryService';

interface ReadingProgressModalProps {
  visible: boolean;
  onClose: () => void;
  book: SavedBook | null;
  /** Called when user saves progress - used to trigger UI refresh */
  onProgressUpdated?: () => void;
  /** If true, shows initial setup mode (asking for total pages) */
  isInitialSetup?: boolean;
}

export const ReadingProgressModal: React.FC<ReadingProgressModalProps> = ({
  visible,
  onClose,
  book,
  onProgressUpdated,
  isInitialSetup = false,
}) => {
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPageCount, setLoadingPageCount] = useState(false);

  // Load existing values when modal opens and fetch page count from API if needed
  useEffect(() => {
    if (visible && book) {
      setTotalPages(book.totalPages?.toString() || '');
      setCurrentPage(book.currentPage?.toString() || '');

      // If initial setup and no total pages, try to fetch from OpenLibrary
      if (isInitialSetup && !book.totalPages && book.workKey) {
        fetchPageCountFromApi(book.workKey);
      }
    } else {
      setTotalPages('');
      setCurrentPage('');
    }
  }, [visible, book, isInitialSetup]);

  const fetchPageCountFromApi = async (workKey: string) => {
    setLoadingPageCount(true);
    try {
      const pageInfo = await bookService.getPageCount(workKey);
      if (pageInfo?.pageCount) {
        setTotalPages(pageInfo.pageCount.toString());
      }
    } catch (err) {
      console.log('Could not fetch page count from API:', err);
      // Silently fail - user can enter manually
    } finally {
      setLoadingPageCount(false);
    }
  };

  const calculatedProgress = useCallback(() => {
    const total = parseInt(totalPages, 10);
    const current = parseInt(currentPage, 10);
    if (!total || total <= 0) return 0;
    if (!current || current <= 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [totalPages, currentPage]);

  const handleSave = async () => {
    if (!book) return;

    const total = parseInt(totalPages, 10);
    const current = parseInt(currentPage, 10);

    // Validate total pages
    if (!total || total <= 0) {
      Alert.alert('Error', 'Please enter a valid total page count.');
      return;
    }

    // Validate current page
    if (current && current > total) {
      Alert.alert('Error', 'Current page cannot be greater than total pages.');
      return;
    }

    setSaving(true);
    try {
      await libraryService.setBookPages(book.id, total, current || 0);

      // If this is the initial setup, also start reading
      if (isInitialSetup) {
        await libraryService.startReading(book.id);
      }

      // Check if reading is complete
      if (current && current >= total) {
        Alert.alert(
          'Congratulations! 🎉',
          'You finished the book! Would you like to move it to "Read" list?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => {
                onProgressUpdated?.();
                onClose();
              },
            },
            {
              text: 'Yes',
              onPress: async () => {
                await libraryService.finishReading(book.id);
                onProgressUpdated?.();
                onClose();
              },
            },
          ],
        );
      } else {
        onProgressUpdated?.();
        onClose();
      }
    } catch (err) {
      console.error('Error saving reading progress:', err);
      Alert.alert('Error', 'Failed to save reading progress.');
    } finally {
      setSaving(false);
    }
  };

  const progress = calculatedProgress();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isInitialSetup ? 'Start Reading' : 'Reading Progress'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={saving}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {book && (
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
            )}

            {isInitialSetup && (
              <Text style={styles.description}>
                Enter the total pages and your current page. We'll track your
                progress! 📚
              </Text>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Page</Text>
                <TextInput
                  style={styles.input}
                  value={currentPage}
                  onChangeText={setCurrentPage}
                  keyboardType="number-pad"
                  placeholder="e.g. 45"
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Pages</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      loadingPageCount && styles.inputLoading,
                      totalPages && styles.inputReadonly,
                    ]}
                    value={totalPages}
                    onChangeText={setTotalPages}
                    keyboardType="number-pad"
                    placeholder={loadingPageCount ? 'Loading...' : 'e.g. 350'}
                    placeholderTextColor="#999"
                    editable={!saving && !loadingPageCount && !totalPages}
                  />
                  {loadingPageCount && (
                    <ActivityIndicator
                      size="small"
                      color="#007AFF"
                      style={styles.inputSpinner}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Progress visualization */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              {totalPages && currentPage && (
                <Text style={styles.progressDetail}>
                  {currentPage} / {totalPages} pages
                </Text>
              )}
            </View>

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
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
                accessibilityLabel="Save"
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isInitialSetup ? 'Start Reading' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputLoading: {
    paddingRight: 44,
  },
  inputReadonly: {
    backgroundColor: '#e8e8e8',
    color: '#666',
  },
  inputSpinner: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  progressSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressDetail: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
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
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
