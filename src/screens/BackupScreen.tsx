
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { loadNotes } from '../utils/storage';
import * as Sharing from 'expo-sharing';

export default function BackupScreen() {
  const [busy, setBusy] = useState(false);

  async function backupToFile() {
    setBusy(true);
    try {
      const notes = await loadNotes();
      const json = JSON.stringify(notes, null, 2);
      const path = `${FileSystem.documentDirectory}voice-journal-backup.json`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      } else {
        Alert.alert('Backup saved', `Backup saved to: ${path}`);
      }
    } catch (e) {
      console.error('backup err', e);
      Alert.alert('Backup failed', String(e));
    } finally {
      setBusy(false);
    }
  }

  async function restoreFromFile() {
    Alert.alert('Restore', 'Restore is not automated. Please import the backup JSON and paste it into the app storage manually (or contact me to enable cloud restore).');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Backup & Restore</Text>
      <TouchableOpacity style={styles.btn} onPress={backupToFile}>
        <Text style={{ fontWeight: '700' }}>{busy ? 'Backing up...' : 'Backup notes (export JSON)'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { marginTop: 12 }]} onPress={restoreFromFile}>
        <Text>Restore from backup (manual)</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 16, color: '#666' }}>
        Tip: use the exported JSON to keep a copy in your cloud storage (Google Drive / Dropbox).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:12, backgroundColor:'#fff' },
  heading: { fontSize:20, fontWeight:'700', marginBottom:12 },
  btn: { padding:12, backgroundColor:'#eee', borderRadius:8, alignItems:'center' }
});
