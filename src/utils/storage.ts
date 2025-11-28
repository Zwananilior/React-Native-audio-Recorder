
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  documentDirectory,
  cacheDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  moveAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import { VoiceNote } from '../types';

const STORAGE_KEY = '@voice_notes_v1';
const baseDir = documentDirectory ?? cacheDirectory ?? '';
export const RECORDINGS_DIR = `${baseDir}recordings/`;

export async function ensureRecordingsDir() {
  const info = await getInfoAsync(RECORDINGS_DIR);
  if (!info.exists) await makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
}

export async function loadNotes(): Promise<VoiceNote[]> {
  try {
    await ensureRecordingsDir();
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VoiceNote[]) : [];
  } catch (e) {
    console.warn('loadNotes err', e);
    return [];
  }
}

export async function persistNotes(notes: VoiceNote[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export async function appendAndPersistNote(note: VoiceNote) {
  const notes = await loadNotes();
  const newNotes = [note, ...notes];
  await persistNotes(newNotes);
  return newNotes;
}

export async function deleteFileIfExists(uri: string) {
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}

export { VoiceNote };
