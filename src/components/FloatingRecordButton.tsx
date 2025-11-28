
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function FloatingRecordButton({ onPress }:{ onPress: ()=>void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>Record</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 34,
    backgroundColor: '#e33',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 36,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6
  }
});
