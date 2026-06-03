import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function SceneList({
  scenes,
  currentSceneId,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  onClearChat,
}) {
  const renderScene = ({ item }) => (
    <TouchableOpacity
      style={[styles.sceneItem, item.id === currentSceneId && styles.sceneItemActive]}
      onPress={() => onSelect(item.id)}
    >
      <View style={styles.sceneInfo}>
        <Text style={styles.sceneName}>{item.name}</Text>
        <Text style={styles.scenePrompt} numberOfLines={1}>
          {item.systemPrompt || '无提示词'}
        </Text>
      </View>
      <View style={styles.sceneActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(item.id)}
        >
          <Text style={styles.actionText}>编辑</Text>
        </TouchableOpacity>
        {item.id !== 'default' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onDelete(item.id, item.name)}
          >
            <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>场景列表</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={scenes}
        renderItem={renderScene}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.clearBtn} onPress={onClearChat}>
        <Text style={styles.clearBtnText}>清空对话</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  sceneItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sceneItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  sceneInfo: {
    marginBottom: 8,
  },
  sceneName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  scenePrompt: {
    fontSize: 13,
    color: '#94a3b8',
  },
  sceneActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#64748b',
  },
  deleteText: {
    color: '#ef4444',
  },
  clearBtn: {
    margin: 16,
    padding: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
});
