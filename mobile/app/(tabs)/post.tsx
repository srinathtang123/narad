import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { submitArticle, uploadImage } from '../../lib/api';

const ORANGE = '#E8541E';
const CATEGORIES = ['Politics', 'Technology', 'Education', 'Crime', 'Environment', 'Sports', 'Business', 'Other'];

export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!title.trim() || !body.trim() || !category) {
      return Alert.alert('Missing fields', 'Title, body, and category are required.');
    }
    setLoading(true);
    let image_url: string | undefined;
    if (imageUri) {
      const url = await uploadImage(imageUri);
      if (url) image_url = url;
    }

    const result = await submitArticle({ title, body, category, location_text: location, image_url });
    setLoading(false);

    if (result.error) return Alert.alert('Error', result.error);

    Alert.alert(
      'Submitted!',
      'Your article is under review and will go live once approved.',
      [{ text: 'OK', onPress: resetForm }]
    );
  }

  function resetForm() {
    setTitle(''); setBody(''); setCategory('');
    setLocation(''); setImageUri(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Citizen Journalism</Text>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitText}>Submit</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Media Upload */}
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={20} color="#555" />
            <Text style={styles.mediaBtnText}>Image</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.imagePreviewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImg} onPress={() => setImageUri(null)}>
              <Ionicons name="close-circle" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a headline..."
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Specify state, city, or area"
          value={location}
          onChangeText={setLocation}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, category === c && styles.catChipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Body */}
        <Text style={styles.label}>Write your story *</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          placeholder="Write your story..."
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  header: { fontSize: 18, fontWeight: '700', color: '#111' },
  submitBtn: { backgroundColor: ORANGE, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  form: { padding: 16, gap: 6 },
  mediaRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  mediaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  mediaBtnText: { fontSize: 14, color: '#555' },
  imagePreviewWrapper: { position: 'relative', marginBottom: 12 },
  imagePreview: { width: '100%', height: 180, borderRadius: 10 },
  removeImg: { position: 'absolute', top: 8, right: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#222', backgroundColor: '#fafafa',
  },
  bodyInput: { height: 160, lineHeight: 22 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  catChipActive: { backgroundColor: ORANGE },
  catText: { fontSize: 13, color: '#555', fontWeight: '500' },
  catTextActive: { color: '#fff' },
});
