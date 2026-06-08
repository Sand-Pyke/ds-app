import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from './src/screens/ChatScreen';
import AddSceneScreen from './src/screens/AddSceneScreen';
import EditSceneScreen from './src/screens/EditSceneScreen';
import { ChatProvider, useChat } from './src/store/ChatContext';

const Stack = createNativeStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ChatMain" component={ChatScreen} />
      <Stack.Screen
        name="AddScene"
        component={AddSceneScreen}
        options={{
          headerShown: true,
          title: '添加场景',
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen
        name="EditScene"
        component={EditSceneScreen}
        options={{
          headerShown: true,
          title: '编辑场景',
          headerBackTitle: '返回',
        }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const chatStore = useChat();

  useEffect(() => {
    chatStore.loadStoredData();
  }, []);

  return (
    <NavigationContainer>
      <ChatStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </ChatProvider>
    </SafeAreaProvider>
  );
}
