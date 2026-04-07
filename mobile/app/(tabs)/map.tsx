import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#E8541E';

// Map is deferred to V1.1
export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Ionicons name="map-outline" size={64} color="#ddd" />
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.sub}>Coming in V1.1 — explore news by location on an interactive map.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  sub: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
