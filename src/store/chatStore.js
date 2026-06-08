import { useState, useCallback, useEffect, useRef } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { streamChat } from '../api/deepseekApi';

const DEFAULT_SCENE = {
  id: 'default',
  name: '默认场景',
  systemPrompt: '',
  knowledgeBaseId: '',
  ragTopK: 3,
};

export function useChatStore() {
  const [currentModel, setCurrentModel] = useState('flash');
  const [scenes, setScenes] = useState([DEFAULT_SCENE]);
  const [currentSceneId, setCurrentSceneId] = useState('default');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [accumulatedContent, setAccumulatedContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const conversationHistoryRef = useRef({});
  const abortControllerRef = useRef(null);
  console.log('ChatStore 初始化完成', { currentSceneId });

  const currentScene = scenes.find(s => s.id === currentSceneId) || DEFAULT_SCENE;

  // 初始化加载
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    const savedScenes = await getItem(STORAGE_KEYS.SCENES);
    if (savedScenes && Array.isArray(savedScenes) && savedScenes.length > 0) {
      setScenes(savedScenes);
    }

    const savedCurrentScene = await getItem(STORAGE_KEYS.CURRENT_SCENE);
    if (savedCurrentScene) {
      const sceneExists = (savedScenes || [DEFAULT_SCENE]).find(s => s.id === savedCurrentScene);
      if (sceneExists) {
        setCurrentSceneId(savedCurrentScene);
      }
    }

    const savedModel = await getItem(STORAGE_KEYS.MODEL_PREF);
    if (savedModel && (savedModel === 'flash' || savedModel === 'v4')) {
      setCurrentModel(savedModel);
    }

    const savedConversations = await getItem(STORAGE_KEYS.CONVERSATIONS, {});
    conversationHistoryRef.current = savedConversations;
    if (savedConversations[savedCurrentScene || 'default']) {
      setMessages(savedConversations[savedCurrentScene || 'default']);
    }
  };

  const saveConversations = async () => {
    await setItem(STORAGE_KEYS.CONVERSATIONS, conversationHistoryRef.current);
  };

  const saveScenes = async () => {
    await setItem(STORAGE_KEYS.SCENES, scenes);
  };

  const setActiveModel = useCallback(async (model) => {
    setCurrentModel(model);
    await setItem(STORAGE_KEYS.MODEL_PREF, model);
  }, []);

  const switchScene = useCallback(async (sceneId) => {
    if (currentSceneId === sceneId || isGenerating) return;
    setCurrentSceneId(sceneId);
    await setItem(STORAGE_KEYS.CURRENT_SCENE, sceneId);
    const history = conversationHistoryRef.current;
    setMessages(history[sceneId] || []);
  }, [currentSceneId, isGenerating]);

  const addScene = useCallback(async (name, systemPrompt = '') => {
    const sceneId = 'scene_' + Date.now();
    const newScene = { id: sceneId, name, systemPrompt };
    
    setScenes(prevScenes => {
      const updatedScenes = [...prevScenes, newScene];
      setItem(STORAGE_KEYS.SCENES, updatedScenes);
      return updatedScenes;
    });
    
    conversationHistoryRef.current[sceneId] = [];
    await saveConversations();
    setCurrentSceneId(sceneId);
    await setItem(STORAGE_KEYS.CURRENT_SCENE, sceneId);
    setMessages([]);
  }, []);

  const editScene = useCallback(async (sceneId, updates) => {
    const updatedScenes = scenes.map(s =>
      s.id === sceneId ? { ...s, ...updates } : s
    );
    setScenes(updatedScenes);
    await setItem(STORAGE_KEYS.SCENES, updatedScenes);
  }, [scenes]);

  const deleteScene = useCallback(async (sceneId) => {
    if (sceneId === 'default') return;
    const updatedScenes = scenes.filter(s => s.id !== sceneId);
    setScenes(updatedScenes);
    await setItem(STORAGE_KEYS.SCENES, updatedScenes);
    delete conversationHistoryRef.current[sceneId];
    await saveConversations();
    if (currentSceneId === sceneId) {
      setCurrentSceneId('default');
      await setItem(STORAGE_KEYS.CURRENT_SCENE, 'default');
      setMessages(conversationHistoryRef.current['default'] || []);
    }
  }, [scenes, currentSceneId]);

  const clearChat = useCallback(async () => {
    setMessages([]);
    conversationHistoryRef.current[currentSceneId] = [];
    await saveConversations();
  }, [currentSceneId]);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text || isGenerating) return;
    console.log('[发送消息] 内容:', text.substring(0, 50));

    const history = conversationHistoryRef.current;
    if (!history[currentSceneId]) {
      history[currentSceneId] = [];
    }
    history[currentSceneId].push({ role: 'user', content: text });
    setMessages([...history[currentSceneId]]);
    await saveConversations();

    setIsGenerating(true);
    setAccumulatedContent('');

    const chatMessages = [];
    if (currentScene?.systemPrompt) {
      chatMessages.push({ role: 'system', content: currentScene.systemPrompt });
    }
    for (const turn of history[currentSceneId]) {
      if (turn.role === 'user' || turn.role === 'assistant') {
        chatMessages.push({ role: turn.role, content: turn.content });
      }
    }

    const apiModel = currentModel === 'flash' ? 'deepseek-v4-flash' : 'deepseek-v4-pro';
    let fullContent = '';
    let finished = false;

    const onContent = (content) => {
      fullContent += content;
      setAccumulatedContent(fullContent);
    };

    const onDone = async () => {
      if (finished) return;
      finished = true;
      console.log('[发送消息] 响应完成, 总长度:', fullContent.length);
      if (fullContent.trim()) {
        history[currentSceneId].push({
          role: 'assistant',
          content: fullContent,
        });
        await saveConversations();
        setMessages([...history[currentSceneId]]);
      }
      setIsGenerating(false);
      setAccumulatedContent('');
    };

    const onError = async (error) => {
      if (finished) return;
      finished = true;
      console.error('[发送消息] 异常:', error.message);
      const errorMsg = `抱歉，发生了错误: ${error.message}`;
      history[currentSceneId].push({ role: 'assistant', content: errorMsg });
      setMessages([...history[currentSceneId]]);
      await saveConversations();
      setIsGenerating(false);
      setAccumulatedContent('');
    };

    const request = streamChat(chatMessages, apiModel, { onContent, onDone, onError });
    abortControllerRef.current = { abort: () => { request.abort(); onDone(); } };
  }, [currentSceneId, currentScene, currentModel, isGenerating]);

  return {
    currentModel,
    currentScene,
    currentSceneId,
    scenes,
    messages,
    isGenerating,
    accumulatedContent,
    statusMessage,
    setActiveModel,
    switchScene,
    addScene,
    editScene,
    deleteScene,
    clearChat,
    sendMessage,
    stopGenerating,
    loadStoredData,
  };
}
