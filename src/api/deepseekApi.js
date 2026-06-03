const API_KEY = 'sk-1d5741c1a35a40a785f4afd4e7165547';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function* streamChat(messages, model = 'deepseek-v4-pro', onError) {
  const controller = new AbortController();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误 ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const chunk = JSON.parse(jsonStr);
            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;
            const content = delta.content || null;
            if (content) {
              yield { type: 'content', data: content };
            }
          } catch (e) {}
        }
      }
    }

    yield { type: 'done' };
  } catch (error) {
    if (error.name === 'AbortError') {
      yield { type: 'aborted' };
    } else {
      yield { type: 'error', data: error.message };
    }
  }
}
