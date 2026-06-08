const API_KEY = 'sk-1d5741c1a35a40a785f4afd4e7165547';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

function parseSSEChunk(text) {
  const contents = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'data: [DONE]') continue;
    if (trimmed.startsWith('data: ')) {
      const jsonStr = trimmed.slice(6);
      try {
        const chunk = JSON.parse(jsonStr);
        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;
        const content = delta.content;
        if (content) {
          contents.push(content);
        }
      } catch (e) {}
    }
  }
  return contents;
}

export function streamChat(messages, model = 'deepseek-v4-pro', callbacks) {
  const { onContent, onDone, onError } = callbacks;
  console.log('[streamChat] 开始请求, 消息数:', messages.length, '模型:', model);
  
  const xhr = new XMLHttpRequest();
  let lastProcessedIndex = 0;
  let finished = false;

  xhr.open('POST', API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  
  xhr.onprogress = function(event) {
    if (finished || !xhr.responseText) return;
    
    const responseText = xhr.responseText;
    if (responseText.length > lastProcessedIndex) {
      const newText = responseText.slice(lastProcessedIndex);
      lastProcessedIndex = responseText.length;
      
      const contents = parseSSEChunk(newText);
      for (const content of contents) {
        onContent && onContent(content);
      }
    }
  };
  
  xhr.onload = function() {
    console.log('[streamChat] onload, 状态:', xhr.status);
    if (finished) return;
    
    if (xhr.status >= 200 && xhr.status < 300) {
      const responseText = xhr.responseText || '';
      if (responseText.length > lastProcessedIndex) {
        const newText = responseText.slice(lastProcessedIndex);
        lastProcessedIndex = responseText.length;
        const contents = parseSSEChunk(newText);
        for (const content of contents) {
          onContent && onContent(content);
        }
      }
      finished = true;
      onDone && onDone();
    } else {
      finished = true;
      onError && onError(new Error(`API错误 ${xhr.status}: ${(xhr.responseText || '').substring(0, 200)}`));
    }
  };
  
  xhr.onerror = function() {
    console.error('[streamChat] onerror');
    if (finished) return;
    finished = true;
    onError && onError(new Error('网络请求失败'));
  };
  
  try {
    xhr.send(JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 8192,
    }));
    console.log('[streamChat] 请求已发送');
  } catch (e) {
    console.error('[streamChat] send 异常:', e.message);
    finished = true;
    onError && onError(e);
  }
  
  return {
    abort: () => {
      finished = true;
      xhr.abort();
    }
  };
}
