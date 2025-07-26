import axios from 'axios';
import { StorageService } from './StorageService';
import { AIProvider, AISettings, DEFAULT_AI_SETTINGS, AIProviderType } from '../types/AIProvider';

export interface AIResponse {
  text: string;
  error?: string;
}

export interface ImageGenerationResponse {
  imageUri?: string;
  error?: string;
}

export class AIService {
  private static readonly GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

  // Main text generation method with provider support
  static async generateText(
    prompt: string,
    systemPrompt?: string,
    imageUri?: string,
    providerId?: string,
    settings?: Partial<AISettings>
  ): Promise<AIResponse> {
    try {
      const providers = await StorageService.getAIProviders();
      const defaultProvider = providers.find(p => p.isEnabled) || providers[0];
      const provider = providerId ? providers.find(p => p.id === providerId) || defaultProvider : defaultProvider;
      
      const aiSettings = { ...DEFAULT_AI_SETTINGS, ...settings };

      switch (provider.type) {
        case 'google':
          return this.generateWithGoogle(prompt, systemPrompt, imageUri, provider, aiSettings);
        case 'openai':
          return this.generateWithOpenAI(prompt, systemPrompt, imageUri, provider, aiSettings);
        case 'anthropic':
          return this.generateWithAnthropic(prompt, systemPrompt, imageUri, provider, aiSettings);
        case 'cohere':
          return this.generateWithCohere(prompt, systemPrompt, provider, aiSettings);
        case 'ai_horde':
          return this.generateWithAIHorde(prompt, systemPrompt, provider, aiSettings);
        case 'local_server':
          return this.generateWithLocalServer(prompt, systemPrompt, provider, aiSettings);
        default:
          return { text: '', error: 'Unsupported AI provider' };
      }
    } catch (error: any) {
      console.error('AI Service Error:', error);
      return { text: '', error: error.message || 'An error occurred while generating response.' };
    }
  }

  // Google AI implementation
  private static async generateWithGoogle(
    prompt: string,
    systemPrompt?: string,
    imageUri?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    if (!provider?.apiKey) {
      return { text: '', error: 'Google AI API key not configured.' };
    }

    const contents = [];
    
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}` }]
      });
    }

    const userParts: any[] = [{ text: prompt }];
    
    if (imageUri && provider.supportsVision) {
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageUri
        }
      });
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    const response = await axios.post(
      `${this.GOOGLE_AI_BASE_URL}/models/${provider.models[0]}:generateContent?key=${provider.apiKey}`,
      {
        contents,
        generationConfig: {
          temperature: settings?.temperature || 0.7,
          topK: settings?.topK || 40,
          topP: settings?.topP || 0.9,
          maxOutputTokens: settings?.maxTokens || 1024,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { text: response.data.candidates[0].content.parts[0].text };
    }
    return { text: '', error: 'No response generated' };
  }

  // OpenAI implementation
  private static async generateWithOpenAI(
    prompt: string,
    systemPrompt?: string,
    imageUri?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    if (!provider?.apiKey) {
      return { text: '', error: 'OpenAI API key not configured.' };
    }

    const messages: any[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    const userContent: any[] = [{ type: 'text', text: prompt }];
    
    if (imageUri && provider.supportsVision) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageUri }
      });
    }

    messages.push({ role: 'user', content: userContent });

    const response = await axios.post(
      `${provider.baseUrl}/chat/completions`,
      {
        model: provider.models[0],
        messages,
        temperature: settings?.temperature || 0.7,
        max_tokens: settings?.maxTokens || 1024,
        top_p: settings?.topP || 0.9,
        frequency_penalty: settings?.frequencyPenalty || 0,
        presence_penalty: settings?.presencePenalty || 0,
        stop: settings?.stopSequences || undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        timeout: 30000,
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return { text: response.data.choices[0].message.content };
    }
    return { text: '', error: 'No response generated' };
  }

  // Anthropic implementation
  private static async generateWithAnthropic(
    prompt: string,
    systemPrompt?: string,
    imageUri?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    if (!provider?.apiKey) {
      return { text: '', error: 'Anthropic API key not configured.' };
    }

    const messages: any[] = [];
    
    const userContent: any[] = [{ type: 'text', text: prompt }];
    
    if (imageUri && provider.supportsVision) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: imageUri
        }
      });
    }

    messages.push({ role: 'user', content: userContent });

    const response = await axios.post(
      `${provider.baseUrl}/v1/messages`,
      {
        model: provider.models[0],
        max_tokens: settings?.maxTokens || 1024,
        temperature: settings?.temperature || 0.7,
        top_p: settings?.topP || 0.9,
        system: systemPrompt,
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    if (response.data?.content?.[0]?.text) {
      return { text: response.data.content[0].text };
    }
    return { text: '', error: 'No response generated' };
  }

  // Cohere implementation
  private static async generateWithCohere(
    prompt: string,
    systemPrompt?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    if (!provider?.apiKey) {
      return { text: '', error: 'Cohere API key not configured.' };
    }

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await axios.post(
      `${provider.baseUrl}/generate`,
      {
        model: provider.models[0],
        prompt: fullPrompt,
        max_tokens: settings?.maxTokens || 1024,
        temperature: settings?.temperature || 0.7,
        p: settings?.topP || 0.9,
        k: settings?.topK || 40,
        stop_sequences: settings?.stopSequences || undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        timeout: 30000,
      }
    );

    if (response.data?.generations?.[0]?.text) {
      return { text: response.data.generations[0].text };
    }
    return { text: '', error: 'No response generated' };
  }

  // AI Horde implementation (free)
  private static async generateWithAIHorde(
    prompt: string,
    systemPrompt?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt;

    // Submit generation request
    const submitResponse = await axios.post(
      `${provider.baseUrl}/v2/generate/text/async`,
      {
        prompt: fullPrompt,
        params: {
          max_length: settings?.maxTokens || 1024,
          temperature: settings?.temperature || 0.7,
          top_p: settings?.topP || 0.9,
          top_k: settings?.topK || 40,
          rep_pen: settings?.repetitionPenalty || 1.1,
        },
        models: provider.models,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const requestId = submitResponse.data?.id;
    if (!requestId) {
      return { text: '', error: 'Failed to submit request to AI Horde' };
    }

    // Poll for completion
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `${provider.baseUrl}/v2/generate/text/status/${requestId}`,
        { timeout: 10000 }
      );

      if (statusResponse.data?.done) {
        const generations = statusResponse.data?.generations;
        if (generations?.[0]?.text) {
          return { text: generations[0].text };
        }
        return { text: '', error: 'No text generated' };
      }
    }

    return { text: '', error: 'Request timeout' };
  }

  // Local server implementation
  private static async generateWithLocalServer(
    prompt: string,
    systemPrompt?: string,
    provider?: AIProvider,
    settings?: AISettings
  ): Promise<AIResponse> {
    const messages: any[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      `${provider.baseUrl}/v1/chat/completions`,
      {
        model: provider.models[0],
        messages,
        temperature: settings?.temperature || 0.7,
        max_tokens: settings?.maxTokens || 1024,
        top_p: settings?.topP || 0.9,
        stop: settings?.stopSequences || undefined,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return { text: response.data.choices[0].message.content };
    }
    return { text: '', error: 'No response generated' };
  }

  // Image generation with multiple providers
  static async generateImage(prompt: string, providerId?: string): Promise<ImageGenerationResponse> {
    try {
      const providers = await StorageService.getAIProviders();
      const imageProviders = providers.filter(p => p.supportsImage && p.isEnabled);
      
      if (imageProviders.length === 0) {
        return { error: 'No image generation providers enabled' };
      }

      const provider = providerId 
        ? providers.find(p => p.id === providerId && p.supportsImage) 
        : imageProviders[0];

      if (!provider) {
        return { error: 'Image generation provider not found' };
      }

      switch (provider.type) {
        case 'pollinations':
          return this.generateWithPollinations(prompt);
        case 'openai':
          return this.generateImageWithOpenAI(prompt, provider);
        default:
          return { error: 'Image generation not supported for this provider' };
      }
    } catch (error: any) {
      console.error('Image Generation Error:', error);
      return { error: error.message || 'Failed to generate image' };
    }
  }

  // Pollinations image generation (free)
  private static async generateWithPollinations(prompt: string): Promise<ImageGenerationResponse> {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUri = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;
    
    // Test if image loads
    try {
      const response = await fetch(imageUri, { method: 'HEAD' });
      if (response.ok) {
        return { imageUri };
      }
    } catch (error) {
      console.error('Pollinations error:', error);
    }
    
    return { imageUri }; // Return anyway, let UI handle loading errors
  }

  // OpenAI DALL-E implementation
  private static async generateImageWithOpenAI(prompt: string, provider: AIProvider): Promise<ImageGenerationResponse> {
    if (!provider.apiKey) {
      return { error: 'OpenAI API key not configured' };
    }

    const response = await axios.post(
      `${provider.baseUrl}/images/generations`,
      {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        timeout: 60000,
      }
    );

    if (response.data?.data?.[0]?.url) {
      return { imageUri: response.data.data[0].url };
    }
    return { error: 'No image generated' };
  }

  // Utility methods
  static async summarizeText(text: string): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
    return this.generateText(prompt, 'You are a helpful assistant that creates clear, concise summaries.');
  }

  static async streamText(
    prompt: string,
    systemPrompt?: string,
    onChunk?: (chunk: string) => void,
    providerId?: string,
    settings?: Partial<AISettings>
  ): Promise<AIResponse> {
    // For now, simulate streaming with the regular API
    const response = await this.generateText(prompt, systemPrompt, undefined, providerId, settings);
    
    if (response.text && onChunk) {
      const words = response.text.split(' ');
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          onChunk(words.slice(0, i + 1).join(' '));
        }, i * 50);
      }
    }
    
    return response;
  }

  static validateApiKey(apiKey: string, providerType: AIProviderType): boolean {
    switch (providerType) {
      case 'google':
        return apiKey.startsWith('AIza') && apiKey.length > 20;
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 40;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 40;
      case 'cohere':
        return apiKey.length > 20;
      default:
        return apiKey.length > 0;
    }
  }

  // Legacy methods for backward compatibility
  static getAvailableModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ];
  }
}
