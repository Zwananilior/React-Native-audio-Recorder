
import React, { useState, useEffet } from 'react';
import { View, Text, TouchableOpacty, StyleSheet, Alert } from 'react-native';
import { Audio, AVPlaybackStatus } rom 'expo-av';
import { VoiceNote } from '../types'
import { deleteFileIfExists } from '../uils/storage';

type Props = {
  note: VoiceNote;
  onDeleted: (id: string) => void;
  playbackSpeed?: number;
};

export default function NoteItem({ note, onDeleted, playbackSpeed = 1.0 }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => { sound?.unloadAsync().catch(()=>{}); };
  }, [sound]);

  const playPause = async () => {
    try {
      if (!sound) {
        const s = new Audio.Sound();
        await s.loadAsync({ uri: note.fileUri }, { shouldPlay: true });
        try { await s.setRateAsync(playbackSpeed, true); } catch {}
        s.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(s);
        setIsPlaying(true);
      } else {
        const status = await sound.getStatusAsync();
        if ('isLoaded' in status && status.isLoaded) {
          if (status.isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        }
      }
    } catch (e) {
      console.error('playPause err', e);
      Alert.alert('Playback error', String(e));
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
      setIsPlaying(false);
      sound?.unloadAsync().catch(()=>{});
      setSound(null);
    }
  };

  const confirmDelete = async () => {
    Alert.alert('Delete note', 'Delete this voice note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          if (sound) { await sound.stopAsync(); await sound.unloadAsync(); setSound(null); }
        } catch {}
        await deleteFileIfExists(note.fileUri);
        onDeleted(note.id);
      } }
    ]);
  };

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.meta}>{new Date(note.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0a84ff' }]} onPress={playPause}>
          <Text style={{ color: '#fff' }}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff4d4f' }]} onPress={confirmDelete}>
          <Text style={{ color: '#fff' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  title: { fontWeight: '700', marginBottom: 6 },
  meta: { color: '#666', fontSize: 12 },
  buttons: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 }
});
