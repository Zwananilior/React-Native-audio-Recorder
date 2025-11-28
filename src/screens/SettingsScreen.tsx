
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [highQuality, setHighQuality] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    (async () => {
      const q = await AsyncStorage.getItem('@record_quality_high');
      const s = await AsyncStorage.getItem('@playback_speed');
      if (q != null) setHighQuality(JSON.parse(q));
      if (s != null) setPlaybackSpeed(Number(s));
    })();
  }, []);

  async function toggleQuality(val: boolean) {
    setHighQuality(val);
    await AsyncStorage.setItem('@record_quality_high', JSON.stringify(val));
  }

  async function cycleSpeed() {
    const options = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = options.indexOf(playbackSpeed);
    const next = options[(idx + 1) % options.length];
    setPlaybackSpeed(next);
    await AsyncStorage.setItem('@playback_speed', String(next));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.row}>
        <Text>High recording quality</Text>
        <Switch value={highQuality} onValueChange={toggleQuality} />
      </View>

      <View style={styles.row}>
        <Text>Playback speed</Text>
        <TouchableOpacity style={styles.btn} onPress={cycleSpeed}>
          <Text style={{ fontWeight: '700' }}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.btn}>
          <Text>Backup / Restore (optional)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  btn: { padding: 10, backgroundColor: '#eee', borderRadius: 8 }
});
