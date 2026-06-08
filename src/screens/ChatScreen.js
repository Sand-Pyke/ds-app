import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import SceneList from '../components/SceneList';
import ModelSelector from '../components/ModelSelector';
import { useChat } from '../store/ChatContext';

export default function ChatScreen({ navigation }) {
  const store = useChat();
  const [menuVisible, setMenuVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messagesRef = useRef(null);
  const pendingScrollRef = useRef(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (pendingScrollRef.current && messagesRef.current) {
        messagesRef.current.scrollToBottom();
        pendingScrollRef.current = false;
      }
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleInputFocus = () => {
    pendingScrollRef.current = true;
  };

  const modelName = store.currentModel === 'flash' ? '随便聊聊' : '深入思考';

  const handleMenuPress = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const handleSceneSelect = (sceneId) => {
    store.switchScene(sceneId);
    closeDrawer();
  };

  const handleDeleteScene = (sceneId, sceneName) => {
    if (sceneId === 'default') return;
    store.deleteScene(sceneId);
  };

  const handleClearChat = () => {
    store.clearChat();
    closeDrawer();
  };

  const handleModelSelect = (model) => {
    store.setActiveModel(model);
  };

  const handleAddScene = () => {
    closeDrawer();
    navigation.navigate('AddScene');
  };

  const handleEditScene = (sceneId) => {
    closeDrawer();
    navigation.navigate('EditScene', { sceneId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        sceneName={store.currentScene?.name || '默认场景'}
        modelName={modelName}
        onMenuPress={handleMenuPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatArea}
      >
        <ChatMessages
          ref={messagesRef}
          messages={store.messages}
          isGenerating={store.isGenerating}
          accumulatedContent={store.accumulatedContent}
        />

        <View style={styles.inputArea}>
          <ChatInput
            isGenerating={store.isGenerating}
            onSend={store.sendMessage}
            onStop={store.stopGenerating}
            onFocus={handleInputFocus}
          />
        </View>
      </KeyboardAvoidingView>

      {/* 侧边抽屉菜单 */}
      <Modal
        visible={menuVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlayInner} onPress={closeDrawer}>
            <Animated.View
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', opacity: fadeAnim }}
            />
          </TouchableOpacity>
          <Animated.View
            style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}
          >
            <ModelSelector
              currentModel={store.currentModel}
              onSelect={handleModelSelect}
            />
            <View style={styles.sceneListWrapper}>
              <SceneList
                scenes={store.scenes}
                currentSceneId={store.currentSceneId}
                onSelect={handleSceneSelect}
                onEdit={handleEditScene}
                onDelete={handleDeleteScene}
                onAdd={handleAddScene}
                onClearChat={handleClearChat}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatArea: {
    flex: 1,
  },
  inputArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalOverlayInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#f8fafc',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 44,
    paddingHorizontal: 16,
  },
  sceneListWrapper: {
    flex: 1,
    marginTop: 8,
  },
});
