import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchArticle } from '../../lib/api';

const ORANGE = '#E8541E';

type Article = {
  id: string; title: string; body: string; category: string;
  location_text: string; image_url: string | null;
  created_at: string; status: string;
  users: { name: string; city: string };
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle(id).then((data) => {
      setArticle(data);
      navigation.setOptions({ title: data?.category || 'Article' });
      setLoading(false);
    });
  }, [id]);

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={ORANGE} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Article not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {article.image_url && (
          <Image source={{ uri: article.image_url }} style={styles.heroImage} />
        )}

        <View style={styles.body}>
          {/* AI Verified badge */}
          {article.status === 'live' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={styles.verifiedText}>AI Verified</Text>
            </View>
          )}

          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {(article.users?.name || 'A')[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{article.users?.name || 'Anonymous'}</Text>
                <Text style={styles.metaDetail}>
                  {formatDate(article.created_at)}
                  {article.location_text ? ` · ${article.location_text}` : ''}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.articleBody}>{article.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImage: { width: '100%', height: 220 },
  body: { padding: 20 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10,
  },
  verifiedText: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  category: { fontSize: 12, color: ORANGE, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', lineHeight: 30, marginBottom: 16 },
  metaRow: { marginBottom: 20 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
  },
  authorAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#333' },
  metaDetail: { fontSize: 12, color: '#aaa', marginTop: 1 },
  articleBody: { fontSize: 16, color: '#333', lineHeight: 26 },
  errorText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
});
