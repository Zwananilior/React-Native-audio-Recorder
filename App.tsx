// App.tsx
import Reat, { createContext, useEffect, useState } from 'react';
import { LgBox } from 'react-native';
import { SfeAreaProvider } from 'react-native-safe-area-context';
import { NvigationContainer } from '@react-navigation/native';
import { reateNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import RecorderScreen from './src/screens/RecorderScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BackupScreen from './src/screens/BackupScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsContextType = {
  playbackSpeed: number;
  setPlaybackSpeed: (v: number) => Promise<void>;
  highQuality: boolean;
  setHighQuality: (v: boolean) => Promise<void>;
  ready: boolean;
};

export const SettingsContext = createContext<SettingsContextType>({
  playbackSpeed: 1,
  setPlaybackSpeed: async () => {},
  highQuality: true,
  setHighQuality: async () => {},
  ready: false,
});

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [highQuality, setHighQualityState] = useState<boolean>(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs([
      'Expo AV has been deprecated',
      'SafeAreaView has been deprecated',
      'Method getInfoAsync imported from "expo-file-system" is deprecated.'
    ]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const ps = await AsyncStorage.getItem('@playback_speed');
        const hq = await AsyncStorage.getItem('@record_quality_high');
        if (ps != null) setPlaybackSpeedState(Number(ps));
        if (hq != null) setHighQualityState(JSON.parse(hq));
      } catch (e) {
        console.warn('load settings err', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function setPlaybackSpeed(v: number) {
    setPlaybackSpeedState(v);
    await AsyncStorage.setItem('@playback_speed', String(v));
  }

  async function setHighQuality(v: boolean) {
    setHighQualityState(v);
    await AsyncStorage.setItem('@record_quality_high', JSON.stringify(v));
  }

  return (
    <SafeAreaProvider>
      <SettingsContext.Provider value={{
        playbackSpeed,
        setPlaybackSpeed,
        highQuality,
        setHighQuality,
        ready
      }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Voice Journal' }} />
            <Stack.Screen name="Recorder" component={RecorderScreen} options={{ title: 'Record Note' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Backup" component={BackupScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsContext.Provider>
    </SafeAreaProvider>
  );
}
