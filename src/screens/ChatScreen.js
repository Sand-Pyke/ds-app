import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import SceneList from '../components/SceneList';
import ModelSelector from '../components/ModelSelector';
import { useChat } from '../store/ChatContext';

export default function ChatScreen({ navigation }) {
  const store = useChat();
  const [menuVisible, setMenuVisible] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const modelName = store.currentModel === 'flash' ? '随便聊聊' : '深入思考';

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleSceneSelect = (sceneId) => {
    store.switchScene(sceneId);
    setMenuVisible(false);
  };

  const handleDeleteScene = (sceneId, sceneName) => {
    if (sceneId === 'default') return;
    store.deleteScene(sceneId);
  };

  const handleClearChat = () => {
    store.clearChat();
    setMenuVisible(false);
  };

  const handleModelSelect = (model) => {
    store.setActiveModel(model);
  };

  const handleAddScene = () => {
    setMenuVisible(false);
    navigation.navigate('AddScene');
  };

  const handleEditScene = (sceneId) => {
    setMenuVisible(false);
    navigation.navigate('EditScene', { sceneId });
  };

  return (
    <View style={styles.container}>
      <ChatHeader
        sceneName={store.currentScene?.name || '默认场景'}
        modelName={modelName}
        onMenuPress={handleMenuPress}
      />

      <ChatMessages
        messages={store.messages}
        isGenerating={store.isGenerating}
        accumulatedContent={store.accumulatedContent}
        autoScroll={autoScroll}
      />

      <ChatInput
        isGenerating={store.isGenerating}
        onSend={store.sendMessage}
        onStop={store.stopGenerating}
      />

      {/* 侧边菜单 */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
            <View style={styles.modalClose}>
              <View style={styles.closeBar} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  sceneListWrapper: {
    flex: 1,
    marginTop: 8,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeBar: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
});
