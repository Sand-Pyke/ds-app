import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';

export default function SettingsScreen() {
  const [currentModel, setCurrentModel] = useState('flash');
  const [totalScenes, setTotalScenes] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const model = await getItem(STORAGE_KEYS.MODEL_PREF, 'flash');
    setCurrentModel(model);

    const scenes = await getItem(STORAGE_KEYS.SCENES, []);
    setTotalScenes(scenes.length);

    const conversations = await getItem(STORAGE_KEYS.CONVERSATIONS, {});
    let msgCount = 0;
    Object.values(conversations).forEach(arr => {
      msgCount += arr.length;
    });
    setTotalMessages(msgCount);

    const settings = await getItem(STORAGE_KEYS.SETTINGS, {});
    setDarkMode(settings.darkMode || false);
    setAutoScroll(settings.autoScroll !== false);
  };

  const handleModelChange = async (model) => {
    setCurrentModel(model);
    await setItem(STORAGE_KEYS.MODEL_PREF, model);
  };

  const handleToggleDarkMode = async (value) => {
    setDarkMode(value);
    const settings = await getItem(STORAGE_KEYS.SETTINGS, {});
    settings.darkMode = value;
    await setItem(STORAGE_KEYS.SETTINGS, settings);
  };

  const handleToggleAutoScroll = async (value) => {
    setAutoScroll(value);
    const settings = await getItem(STORAGE_KEYS.SETTINGS, {});
    settings.autoScroll = value;
    await setItem(STORAGE_KEYS.SETTINGS, settings);
  };

  const handleClearAllData = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有数据吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await removeItem(STORAGE_KEYS.CONVERSATIONS);
            await removeItem(STORAGE_KEYS.SCENES);
            await removeItem(STORAGE_KEYS.CURRENT_SCENE);
            await removeItem(STORAGE_KEYS.MODEL_PREF);
            setTotalScenes(0);
            setTotalMessages(0);
            Alert.alert('提示', '所有数据已清空');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>模型设置</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => handleModelChange('flash')}
        >
          <View>
            <Text style={styles.rowTitle}>随便聊聊</Text>
            <Text style={styles.rowDesc}>快速响应，适合日常对话</Text>
          </View>
          {currentModel === 'flash' && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => handleModelChange('v4')}
        >
          <View>
            <Text style={styles.rowTitle}>深入思考</Text>
            <Text style={styles.rowDesc}>深度分析，适合复杂问题</Text>
          </View>
          {currentModel === 'v4' && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>偏好设置</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>深色模式</Text>
          <Switch
            value={darkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={darkMode ? '#3b82f6' : '#f1f5f9'}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowTitle}>自动滚动</Text>
          <Switch
            value={autoScroll}
            onValueChange={handleToggleAutoScroll}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={autoScroll ? '#3b82f6' : '#f1f5f9'}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>数据统计</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>场景数量</Text>
          <Text style={styles.statValue}>{totalScenes} 个</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowTitle}>消息总数</Text>
          <Text style={styles.statValue}>{totalMessages} 条</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAllData}>
        <Text style={styles.dangerBtnText}>清空所有数据</Text>
      </TouchableOpacity>

      <Text style={styles.version}>孝虎AI v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowTitle: {
    fontSize: 16,
    color: '#1e293b',
  },
  rowDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 16,
  },
  statValue: {
    fontSize: 16,
    color: '#64748b',
  },
  dangerBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
    color: '#94a3b8',
    fontSize: 13,
  },
});
