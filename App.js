import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import ChatScreen from './src/screens/ChatScreen';
import AddSceneScreen from './src/screens/AddSceneScreen';
import EditSceneScreen from './src/screens/EditSceneScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ChatProvider, useChat } from './src/store/ChatContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

function TabIcon({ name, focused }) {
  const icons = {
    Chat: '💬',
    Settings: '⚙️',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
}

function AppNavigator() {
  const chatStore = useChat();

  useEffect(() => {
    chatStore.loadStoredData();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            height: 85,
            paddingTop: 8,
            paddingBottom: 28,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Chat"
          component={ChatStack}
          options={{ title: '对话' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: '设置' }}
        />
      </Tab.Navigator>
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

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
