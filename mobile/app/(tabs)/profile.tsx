import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMyProfile, updateProfile } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const ORANGE = '#E8541E';

const STATUS_COLOR: Record<string, string> = {
  live: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
};

type Profile = {
  id: string; name: string; city: string;
  articles: Array<{ id: string; title: string; category: string; status: string; created_at: string }>;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  async function load() {
    const data = await fetchMyProfile();
    setProfile(data);
    setName(data.name || '');
    setCity(data.city || '');
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveProfile() {
    await updateProfile({ name, city });
    setEditing(false);
    load();
  }

  async function signOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={ORANGE} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>TheNarad</Text>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={profile?.articles || []}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={
          <View>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(name || 'U')[0].toUpperCase()}</Text>
              </View>

              {editing ? (
                <View style={styles.editForm}>
                  <TextInput style={styles.editInput} value={name} onChangeText={setName} placeholder="Your name" />
                  <TextInput style={styles.editInput} value={city} onChangeText={setCity} placeholder="Your city" />
                  <View style={styles.editRow}>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditing(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{name || 'Anonymous'}</Text>
                  <Text style={styles.profileCity}>{city || 'Location not set'}</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{profile?.articles?.length || 0}</Text>
                  <Text style={styles.statLabel}>Articles</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>My Articles</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>No articles posted yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.articleRow}>
            <View style={styles.articleInfo}>
              <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.articleCat}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  appTitle: { fontSize: 18, fontWeight: '800', color: ORANGE },
  profileCard: {
    backgroundColor: '#fff', padding: 20, alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  profileInfo: { alignItems: 'center', gap: 4 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#111' },
  profileCity: { fontSize: 14, color: '#888' },
  editBtn: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 6, marginTop: 10,
  },
  editBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  editForm: { width: '100%', gap: 8 },
  editInput: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 8,
    padding: 10, fontSize: 15, color: '#222',
  },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  saveBtn: { backgroundColor: ORANGE, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelText: { color: '#aaa', fontSize: 14 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  stat: { alignItems: 'center', paddingHorizontal: 20 },
  statNum: { fontSize: 20, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 12, color: '#aaa' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 16, paddingVertical: 10 },
  articleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 14, fontWeight: '600', color: '#111', lineHeight: 19 },
  articleCat: { fontSize: 11, color: ORANGE, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
});
