
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Recorder from '../components/Recorder';

export default function RecorderScreen() {
  return (
    <View style={styles.container}>
      <Recorder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' }
});
