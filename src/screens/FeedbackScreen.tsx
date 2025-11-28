
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const [text, setText] = useState('');

  async function submit() {
    if (!text.trim()) {
      Alert.alert('Please enter feedback first');
      return;
    }
    try {
      const raw = await AsyncStorage.getItem('@feedbacks_v1');
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ message: text.trim(), createdAt: new Date().toISOString() });
      await AsyncStorage.setItem('@feedbacks_v1', JSON.stringify(arr));
      Alert.alert('Thanks!', 'Feedback saved locally.');
      setText('');
    } catch (e) {
      Alert.alert('Failed to save feedback', String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Feedback & Support</Text>
      <TextInput
        placeholder="Describe an issue or suggestion..."
        value={text}
        onChangeText={setText}
        multiline
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={{ fontWeight: '700' }}>Send Feedback</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 12, color: '#666' }}>
        Feedback is saved locally. If you'd like, I can wire it to a webhook or Firebase to receive it remotely.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:12, backgroundColor:'#fff' },
  heading: { fontSize:20, fontWeight:'700', marginBottom:12 },
  input: { minHeight:120, borderWidth:1, borderColor:'#ddd', padding:12, borderRadius:8 },
  btn: { marginTop:12, padding:12, backgroundColor:'#0a84ff', borderRadius:8, alignItems:'center' }
});
