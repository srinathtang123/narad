import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchArticles } from '../../lib/api';

const ORANGE = '#E8541E';
const TABS = ['For You', 'My City'];
const CATEGORIES = ['All', 'Politics', 'Technology', 'Education', 'Crime', 'Environment', 'Sports', 'Business'];

type Article = {
  id: string;
  title: string;
  body: string;
  category: string;
  location_text: string;
  image_url: string | null;
  created_at: string;
  users: { name: string; city: string };
};

export default function HomeScreen() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [category, setCategory] = useState('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const data = await fetchArticles({
      tab: tab === 1 ? 'mycity' : 'foryou',
      category: category !== 'All' ? category : undefined,
    });
    setArticles(Array.isArray(data) ? data : []);
    if (isRefresh) setRefreshing(false);
  }

  useEffect(() => { load(); }, [tab, category]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Ionicons name="bookmark-outline" size={24} color="#333" />
        <Text style={styles.appTitle}>TheNarad</Text>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      {/* Feed Tabs */}
      <View style={styles.feedTabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setTab(i)} style={styles.feedTabBtn}>
            <Text style={[styles.feedTabText, tab === i && styles.feedTabActive]}>{t}</Text>
            {tab === i && <View style={styles.feedTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item && styles.catChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Articles */}
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[ORANGE]} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>No articles yet. Pull to refresh.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/article/${item.id}`)}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardMeta}>
                <Text style={styles.catBadge}>{item.category}</Text>
                <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardExcerpt} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.authorText}>
                {item.users?.name || 'Anonymous'} · {item.location_text || item.users?.city || ''}
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
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  appTitle: { fontSize: 18, fontWeight: '800', color: ORANGE },
  feedTabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16 },
  feedTabBtn: { marginRight: 24, paddingBottom: 8, paddingTop: 10 },
  feedTabText: { fontSize: 15, color: '#999', fontWeight: '600' },
  feedTabActive: { color: '#111' },
  feedTabIndicator: { height: 2, backgroundColor: ORANGE, borderRadius: 2, marginTop: 4 },
  catList: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 6,
  },
  catChipActive: { backgroundColor: ORANGE },
  catText: { fontSize: 13, color: '#555', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 14 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catBadge: { fontSize: 11, color: ORANGE, fontWeight: '700', textTransform: 'uppercase' },
  timeText: { fontSize: 11, color: '#aaa' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6, lineHeight: 22 },
  cardExcerpt: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 8 },
  authorText: { fontSize: 12, color: '#aaa' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
