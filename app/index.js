import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from '../src/navigation/AppNavigator';

export default function AppRoot() {
  return (
    <PaperProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </PaperProvider>
  );
}