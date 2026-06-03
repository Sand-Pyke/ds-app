import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModelSelector({ currentModel, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择模式</Text>
      <TouchableOpacity
        style={[styles.option, currentModel === 'flash' && styles.optionActive]}
        onPress={() => onSelect('flash')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionName}>随便聊聊</Text>
          <Text style={styles.optionDesc}>快速响应，适合日常对话</Text>
        </View>
        {currentModel === 'flash' && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, currentModel === 'v4' && styles.optionActive]}
        onPress={() => onSelect('v4')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionName}>深入思考</Text>
          <Text style={styles.optionDesc}>深度分析，适合复杂问题</Text>
        </View>
        {currentModel === 'v4' && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
