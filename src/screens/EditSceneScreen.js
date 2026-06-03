import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useChat } from '../store/ChatContext';

export default function EditSceneScreen({ route, navigation }) {
  const { sceneId } = route.params || {};
  const { scenes, editScene } = useChat();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      setName(scene.name);
      setPrompt(scene.systemPrompt || '');
    }
  }, [sceneId, scenes]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('提示', '请输入场景名称');
      return;
    }
    await editScene(sceneId, { name: trimmedName, systemPrompt: prompt.trim() });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>编辑场景</Text>

      <Text style={styles.label}>场景名称</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="请输入场景名称"
      />

      <Text style={styles.label}>系统提示词</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="请输入系统提示词（可选）"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>确定</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>取消</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 16,
  },
});
