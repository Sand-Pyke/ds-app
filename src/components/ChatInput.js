import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default function ChatInput({ isGenerating, onSend, onStop, onFocus }) {
  const [text, setText] = useState('');
  const [height, setHeight] = useState(44);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setText('');
    setHeight(44);
  };

  const handleContentSizeChange = (event) => {
    const newHeight = Math.min(Math.max(44, event.nativeEvent.contentSize.height + 16), 200);
    setHeight(newHeight);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { height }]}
          value={text}
          onChangeText={setText}
          placeholder="输入消息..."
          placeholderTextColor="#94a3b8"
          multiline
          textAlignVertical="center"
          onContentSizeChange={handleContentSizeChange}
          onSubmitEditing={handleSend}
          onFocus={onFocus}
        />
        {isGenerating ? (
          <TouchableOpacity style={styles.sendBtn} onPress={onStop}>
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 8,   // 不要留太大，避免键盘弹起时底部有空白
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 4,
    maxHeight: 200,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  stopIcon: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});