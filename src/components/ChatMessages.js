import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';

const markdownStyles = {
  body: { fontSize: 15, lineHeight: 22, color: '#334155' },
  heading1: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginVertical: 8 },
  heading2: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginVertical: 6 },
  heading3: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginVertical: 4 },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#ef4444',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  link: { color: '#3b82f6' },
  blockquote: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
    marginVertical: 8,
  },
  list_item: { marginVertical: 4 },
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  th: { backgroundColor: '#f1f5f9', padding: 8 },
  td: { padding: 8, borderWidth: 1, borderColor: '#e2e8f0' },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '\n');
}

export default function ChatMessages({
  messages,
  isGenerating,
  accumulatedContent,
  autoScroll,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isGenerating, accumulatedContent, autoScroll]);

  const copyMessage = async (content) => {
    await Clipboard.setStringAsync(content);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <View
        key={index}
        style={[styles.message, isUser ? styles.userMessage : styles.assistantMessage]}
      >
        <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
          <Text style={styles.avatarText}>{isUser ? 'U' : 'AI'}</Text>
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageBubble}>
            {isUser ? (
              <Text style={styles.userText}>{msg.content}</Text>
            ) : (
              <>
                <Markdown style={markdownStyles}>{msg.content}</Markdown>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyMessage(msg.content)}
                >
                  <Text style={styles.copyBtnText}>复制</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 && !isGenerating && (
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>欢迎使用孝虎AI</Text>
          <Text style={styles.welcomeText}>有什么我可以帮助你的吗？</Text>
        </View>
      )}

      {messages.map((msg, index) => renderMessage(msg, index))}

      {isGenerating && (
        <View style={[styles.message, styles.assistantMessage]}>
          <View style={[styles.avatar, styles.assistantAvatar]}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageBubble}>
              {!accumulatedContent ? (
                <View style={styles.thinking}>
                  <Text style={styles.thinkingDot}>●</Text>
                  <Text style={styles.thinkingDot}>●</Text>
                  <Text style={styles.thinkingDot}>●</Text>
                </View>
              ) : (
                <Markdown style={markdownStyles}>{accumulatedContent}</Markdown>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  welcome: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#64748b',
  },
  message: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  assistantMessage: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: '#3b82f6',
  },
  assistantAvatar: {
    backgroundColor: '#10b981',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContent: {
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  thinkingDot: {
    fontSize: 12,
    color: '#94a3b8',
    marginHorizontal: 3,
  },
  copyBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  copyBtnText: {
    fontSize: 12,
    color: '#64748b',
  },
});
