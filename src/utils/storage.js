import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  MODEL_PREF: 'deepseek_model_pref',
  SCENES: 'deepseek_scenes',
  CONVERSATIONS: 'deepseek_conversations',
  CURRENT_SCENE: 'deepseek_current_scene',
  SETTINGS: 'deepseek_settings',
};

export async function getItem(key, defaultValue = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return defaultValue;
  } catch (e) {
    console.warn('Storage get error:', e);
    return defaultValue;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage set error:', e);
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('Storage remove error:', e);
  }
}
