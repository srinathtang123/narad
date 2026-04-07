import { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchArticles } from '../../lib/api';

const ORANGE = '#E8541E';

type Article = {
  id: string; title: string; body: string;
  category: string; location_text: string;
  image_url: string | null; created_at: string;
  users: { name: string };
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [searched, setSearched] = useState(false);

  async function doSearch() {
    if (!query.trim()) return;
    const data = await fetchArticles({ q: query.trim() });
    setResults(Array.isArray(data) ? data : []);
    setSearched(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Search</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#aaa" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.input}
          placeholder="Search news, topics, locations..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color="#aaa" style={{ marginRight: 12 }} />
          </TouchableOpacity>
        )}
      </View>

      {!searched && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Search for topics, locations, or keywords</Text>
        </View>
      )}

      {searched && results.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>No results found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/article/${item.id}`)}>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.thumb} />}
            <View style={styles.cardText}>
              <Text style={styles.cat}>{item.category}</Text>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.users?.name || 'Anonymous'} · {item.location_text || ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  header: { fontSize: 22, fontWeight: '800', color: '#111', padding: 16, paddingBottom: 10 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#eee', marginBottom: 12,
  },
  input: { flex: 1, padding: 12, fontSize: 15, color: '#222' },
  hint: { alignItems: 'center', marginTop: 60 },
  hintText: { color: '#aaa', fontSize: 14 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 10, overflow: 'hidden', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  thumb: { width: 80, height: 80 },
  cardText: { flex: 1, padding: 12 },
  cat: { fontSize: 10, color: ORANGE, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
  title: { fontSize: 14, fontWeight: '600', color: '#111', lineHeight: 19 },
  meta: { fontSize: 11, color: '#aaa', marginTop: 4 },
});
