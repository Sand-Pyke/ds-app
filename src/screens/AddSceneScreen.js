import React, { useState } from 'react';
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

export default function AddSceneScreen({ navigation }) {
  const { addScene } = useChat();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedTag, setSelectedTag] = useState('chef');

  const tags = [
    { label: '厨师', value: 'chef', prompt: '你是一位全能的厨师，擅长任何菜系' },
    { label: '医生', value: 'doctor', prompt: '你是一位全能的医生，通晓任何疑难杂症' },
    { label: '生活百科', value: 'life_expert', prompt: '你是一位生活专家，了解日常生活的方方面面' },
    { label: '其他', value: 'other', prompt: '' },
  ];

  const handleTagSelect = (tag) => {
    setSelectedTag(tag.value);
    if (tag.value !== 'other') {
      setName(tag.label);
      setPrompt(tag.prompt);
    } else {
      setName('');
      setPrompt('');
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('提示', '请输入场景名称');
      return;
    }
    await addScene(trimmedName, prompt.trim());
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>添加场景</Text>

      <Text style={styles.label}>选择类型</Text>
      <View style={styles.tags}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.value}
            style={[styles.tag, selectedTag === tag.value && styles.tagActive]}
            onPress={() => handleTagSelect(tag)}
          >
            <Text style={[styles.tagText, selectedTag === tag.value && styles.tagTextActive]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTag === 'other' && (
        <>
          <Text style={styles.label}>场景名称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="请输入场景名称"
          />
        </>
      )}

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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  tagText: {
    fontSize: 14,
    color: '#64748b',
  },
  tagTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
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
