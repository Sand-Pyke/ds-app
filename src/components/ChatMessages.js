import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing, Keyboard } from 'react-native';
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

function ThinkingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const animRef = useRef(null);

  useEffect(() => {
    animRef.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(0),
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animRef.current.start();

    return () => {
      if (animRef.current) {
        animRef.current.stop();
      }
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.thinking}>
      <Animated.Text style={[styles.thinkingDot, { opacity: dot1 }]}>●</Animated.Text>
      <Animated.Text style={[styles.thinkingDot, { opacity: dot2 }]}>●</Animated.Text>
      <Animated.Text style={[styles.thinkingDot, { opacity: dot3 }]}>●</Animated.Text>
    </View>
  );
}

const ChatMessages = forwardRef(function ChatMessages({
  messages,
  isGenerating,
  accumulatedContent,
}, ref) {
  const scrollRef = useRef(null);
  const lastOffsetY = useRef(0);
  const isUserDraggingRef = useRef(false);
  const [showBottomBtn, setShowBottomBtn] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToBottom
  }));

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isGenerating, accumulatedContent]);

  const copyMessage = async (content) => {
    await Clipboard.setStringAsync(content);
  };

  const handleScrollBeginDrag = (event) => {
    isUserDraggingRef.current = true;
    lastOffsetY.current = event.nativeEvent.contentOffset.y;
  };

  const handleScrollEndDrag = () => {
    isUserDraggingRef.current = false;
  };

  const handleMomentumScrollEnd = () => {
    isUserDraggingRef.current = false;
  };

  const handleScroll = (event) => {
    const { contentSize, layoutMeasurement, contentOffset } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    setShowBottomBtn(distanceFromBottom > 100);

    if (isUserDraggingRef.current && contentOffset.y < lastOffsetY.current - 3) {
      Keyboard.dismiss();
    }
    lastOffsetY.current = contentOffset.y;
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
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
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
                  <ThinkingDots />
                ) : (
                  <Markdown style={markdownStyles}>{accumulatedContent}</Markdown>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {showBottomBtn && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomBtn}
          onPress={scrollToBottom}
        >
          <Text style={styles.bottomBtnText}>↓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default ChatMessages;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
  },
  welcome: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  bottomBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    lineHeight: 24,
  },
});
