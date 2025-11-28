
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import NoteItem from '../components/NoteItem';
import { loadNotes, persistNotes, VoiceNote } from '../utils/storage';
import FloatingRecordButton from '../components/FloatingRecordButton';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../../App';  

export default function HomeScreen() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const settings = useContext(SettingsContext);

  useEffect(() => {
    if (!settings.ready) return;
    (async () => {
      const n = await loadNotes();
      setNotes(n);
    })();
  }, [isFocused, settings.ready]);

  async function handleDelete(id: string) {
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    await persistNotes(filtered);
  }

  function filtered() {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      (n.title ?? '').toLowerCase().includes(q) ||
      new Date(n.createdAt).toLocaleString().toLowerCase().includes(q)
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} style={{ marginRight: 8 }} />
          <TextInput placeholder="Search by title or date..." value={search} onChangeText={setSearch} style={styles.searchInput} />
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings' as never)}>
          <Ionicons name="settings" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} onPress={() => navigation.navigate('Backup' as never)}>
          <Ionicons name="cloud-upload" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} onPress={() => navigation.navigate('Feedback' as never)}>
          <Ionicons name="chatbubble-ellipses" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered().sort((a,b)=> Date.parse(b.createdAt)-Date.parse(a.createdAt))}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <NoteItem note={item} onDeleted={handleDelete} playbackSpeed={settings.playbackSpeed} />
        )}
        ListEmptyComponent={() => <View style={styles.empty}><Text>No voice notes — press Record.</Text></View>}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <FloatingRecordButton onPress={() => navigation.navigate('Recorder' as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  searchInput: { flex: 1 },
  headerBtn: { padding: 8, borderRadius: 8, backgroundColor: '#eee', marginLeft: 6 },
  empty: { alignItems: 'center', marginTop: 40 }
});
