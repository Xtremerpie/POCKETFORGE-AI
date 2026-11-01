import { AIProviderId, AIProviderConfig, AISettings, AIChatMessage } from '../types';

const STORAGE_KEY_AI_SETTINGS = 'pocketforge_ai_settings';

export const DEFAULT_AI_SETTINGS: AISettings = {
  primaryProvider: 'gemini',
  fallbackProvider: 'groq',
  enableFallback: true,
  temperature: 0.7,
  providers: {
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      apiKey: '',
      selectedModel: 'gemini-2.5-flash',
      availableModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
      enabled: true,
      status: 'unconfigured'
    },
    groq: {
      id: 'groq',
      name: 'Groq Cloud',
      apiKey: '',
      selectedModel: 'llama-3.3-70b-versatile',
      availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
      enabled: true,
      status: 'unconfigured'
    },
    openrouter: {
      id: 'openrouter',
      name: 'OpenRouter',
      apiKey: '',
      selectedModel: 'deepseek/deepseek-chat',
      availableModels: ['deepseek/deepseek-chat', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.3-70b-instruct'],
      enabled: false,
      status: 'unconfigured'
    }
  }
};

export function getStoredAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
        providers: {
          ...DEFAULT_AI_SETTINGS.providers,
          ...(parsed.providers || {})
        }
      };
    }
  } catch (e) {}
  return DEFAULT_AI_SETTINGS;
}

export function saveStoredAISettings(settings: AISettings) {
  localStorage.setItem(STORAGE_KEY_AI_SETTINGS, JSON.stringify(settings));
}

// Direct Provider API Callers
async function callGemini(
  config: AIProviderConfig,
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<{ text: string; tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  if (!config.apiKey) throw new Error('Gemini API key is not configured.');

  const model = config.selectedModel || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata ? {
    promptTokens: data.usageMetadata.promptTokenCount || 0,
    completionTokens: data.usageMetadata.candidatesTokenCount || 0,
    totalTokens: data.usageMetadata.totalTokenCount || 0
  } : undefined;

  return { text, tokenUsage: usage };
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  extraHeaders: Record<string, string> = {}
): Promise<{ text: string; tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  if (!apiKey) throw new Error('API key is not configured.');

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of messages) {
    formattedMessages.push({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    });
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `API error: ${response.status}`);
  }

  const text = data.choices?.[0]?.message?.content || '';
  const usage = data.usage ? {
    promptTokens: data.usage.prompt_tokens || 0,
    completionTokens: data.usage.completion_tokens || 0,
    totalTokens: data.usage.total_tokens || 0
  } : undefined;

  return { text, tokenUsage: usage };
}

export async function testProviderConnection(providerId: AIProviderId, settings?: AISettings): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
}> {
  const currentSettings = settings || getStoredAISettings();
  const provider = currentSettings.providers[providerId];
  if (!provider || !provider.apiKey) {
    return { success: false, latencyMs: 0, message: 'API key is missing' };
  }

  const start = performance.now();
  try {
    let result: { text: string };
    if (providerId === 'gemini') {
      result = await callGemini(provider, [{ role: 'user', content: 'Respond with the single word "OK"' }]);
    } else if (providerId === 'groq') {
      result = await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        provider.apiKey,
        provider.selectedModel,
        [{ role: 'user', content: 'Respond with the single word "OK"' }]
      );
    } else {
      result = await callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        provider.apiKey,
        provider.selectedModel,
        [{ role: 'user', content: 'Respond with the single word "OK"' }],
        undefined,
        { 'HTTP-Referer': 'https://pocketforge.dev', 'X-Title': 'PocketForge AI' }
      );
    }

    const latencyMs = Math.round(performance.now() - start);
    return {
      success: true,
      latencyMs,
      message: `Connected successfully (${latencyMs}ms)`
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Math.round(performance.now() - start),
      message: err.message || 'Connection failed'
    };
  }
}

export async function generateAIResponse(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  settings?: AISettings
): Promise<{ text: string; providerUsed: AIProviderId; modelUsed: string; tokenUsage?: any }> {
  const currentSettings = settings || getStoredAISettings();
  const primaryId = currentSettings.primaryProvider;
  const primaryConfig = currentSettings.providers[primaryId];

  // Try primary provider
  try {
    if (!primaryConfig.apiKey) {
      throw new Error(`Primary provider (${primaryConfig.name}) is missing an API key.`);
    }

    let res: { text: string; tokenUsage?: any };
    if (primaryId === 'gemini') {
      res = await callGemini(primaryConfig, messages, systemPrompt);
    } else if (primaryId === 'groq') {
      res = await callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', primaryConfig.apiKey, primaryConfig.selectedModel, messages, systemPrompt);
    } else {
      res = await callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', primaryConfig.apiKey, primaryConfig.selectedModel, messages, systemPrompt);
    }

    return {
      text: res.text,
      providerUsed: primaryId,
      modelUsed: primaryConfig.selectedModel,
      tokenUsage: res.tokenUsage
    };
  } catch (primaryError: any) {
    console.warn(`Primary AI provider (${primaryId}) failed:`, primaryError.message);

    // Check if fallback is enabled and available
    const fallbackId = currentSettings.fallbackProvider;
    if (currentSettings.enableFallback && fallbackId && fallbackId !== primaryId) {
      const fallbackConfig = currentSettings.providers[fallbackId];
      if (fallbackConfig && fallbackConfig.apiKey) {
        console.info(`Switching to fallback AI provider: ${fallbackConfig.name}`);
        try {
          let res: { text: string; tokenUsage?: any };
          if (fallbackId === 'gemini') {
            res = await callGemini(fallbackConfig, messages, systemPrompt);
          } else if (fallbackId === 'groq') {
            res = await callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', fallbackConfig.apiKey, fallbackConfig.selectedModel, messages, systemPrompt);
          } else {
            res = await callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', fallbackConfig.apiKey, fallbackConfig.selectedModel, messages, systemPrompt);
          }

          return {
            text: res.text,
            providerUsed: fallbackId,
            modelUsed: fallbackConfig.selectedModel,
            tokenUsage: res.tokenUsage
          };
        } catch (fallbackError: any) {
          throw new Error(`Primary (${primaryError.message}) and Fallback (${fallbackError.message}) both failed.`);
        }
      }
    }

    throw primaryError;
  }
}
