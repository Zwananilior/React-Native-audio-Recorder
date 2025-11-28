
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  documentDirectory,
  cacheDirectory,
  moveAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { VoiceNote } from '../types';
import { appendAndPersistNote, ensureRecordingsDir } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

type Props = {
  onNewNote?: (note: VoiceNote) => void;
};

export default function Recorder({ onNewNote }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [tempUri, setTempUri] = useState<string | null>(null);
  const [proposedTitle, setProposedTitle] = useState('');
  const navigation = useNavigation();

  const DOCUMENT_DIR: string = (documentDirectory ?? cacheDirectory ?? '') as string;

  async function start() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please enable microphone permission.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync((Audio as any).RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      console.error('start record', e);
      Alert.alert('Recording error', String(e));
    }
  }

  async function stop() {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI');

      setTempUri(uri);
      setProposedTitle(`Voice note ${new Date().toLocaleString()}`);
      setTitleModalVisible(true);
    } catch (e) {
      console.error('stop record', e);
      Alert.alert('Stop error', String(e));
      setIsRecording(false);
      setRecording(null);
    } finally {
      setIsRecording(false);
      setRecording(null);
    }
  }

  async function saveWithTitle() {
    if (!tempUri) return;
    try {
      await ensureRecordingsDir();
      const id = await Crypto.randomUUID();
      const ext = tempUri.split('.').pop() ?? (Platform.OS === 'ios' ? 'caf' : 'm4a');
      const dest = `${DOCUMENT_DIR}recordings/${id}.${ext}`;

      await moveAsync({ from: tempUri, to: dest });

      const note: VoiceNote = {
        id,
        fileUri: dest,
        title: proposedTitle || `Voice note ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
      };

      
      await appendAndPersistNote(note);
      onNewNote?.(note);

      
      try {
        
        navigation.goBack();
      } catch {}

    } catch (e) {
      console.error('saveWithTitle err', e);
      Alert.alert('Save failed', String(e));
    } finally {
      setTitleModalVisible(false);
      setTempUri(null);
      setProposedTitle('');
    }
  }

  function cancelSave() {
    if (tempUri) {
      deleteAsync(tempUri, { idempotent: true }).catch(() => {});
    }
    setTitleModalVisible(false);
    setTempUri(null);
    setProposedTitle('');
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recording]}
        onPress={isRecording ? stop : start}
      >
        <Text style={styles.btnText}>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableOpacity>

      <Modal visible={titleModalVisible} animationType="slide" transparent>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.modal}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Name your voice note</Text>
            <TextInput
              placeholder="Enter a descriptive title"
              value={proposedTitle}
              onChangeText={setProposedTitle}
              style={modalStyles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity style={modalStyles.btn} onPress={cancelSave}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.btn, { backgroundColor: '#0a84ff' }]}
                onPress={saveWithTitle}
              >
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 12 },
  button: { padding: 14, borderRadius: 10, backgroundColor: '#e33', alignItems: 'center' },
  recording: { backgroundColor: '#a00' },
  btnText: { color: '#fff', fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 },
  btn: { padding: 10, borderRadius: 8, backgroundColor: '#eee', marginLeft: 8, paddingHorizontal: 12 },
});
