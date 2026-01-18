import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string, color: string) => void;
}

const ICONS = [
  '📚',
  '❤️',
  '⭐',
  '🔖',
  '📖',
  '🎯',
  '🏆',
  '💡',
  '🎨',
  '🎵',
  '🌟',
  '📝',
];
const COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#E91E63', // Pink
  '#607D8B', // Grey
  '#795548', // Brown
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#FFEB3B', // Yellow
];

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('List name cannot be empty');
      return;
    }
    if (trimmedName.length < 2) {
      setError('List name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 50) {
      setError('List name cannot exceed 50 characters');
      return;
    }

    onSubmit(trimmedName, selectedIcon, selectedColor);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor(COLORS[0]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New List</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>List Name</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="e.g. My Favorites"
                value={name}
                onChangeText={text => {
                  setName(text);
                  setError(null);
                }}
                maxLength={50}
                autoFocus
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Icon Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.iconButtonSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                    accessibilityLabel={`Icon ${icon}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    accessibilityLabel={`Color ${color}`}
                    accessibilityRole="button"
                  >
                    {selectedColor === color && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View
                style={[styles.preview, { borderLeftColor: selectedColor }]}
              >
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: selectedColor + '20' },
                  ]}
                >
                  <Text style={styles.previewIconText}>{selectedIcon}</Text>
                </View>
                <Text style={styles.previewName} numberOfLines={1}>
                  {name || 'List Name'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !name.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!name.trim()}
              accessibilityLabel="Create list"
              accessibilityRole="button"
            >
              <Text style={styles.submitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  iconText: {
    fontSize: 22,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333',
  },
  colorCheck: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewIconText: {
    fontSize: 20,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
