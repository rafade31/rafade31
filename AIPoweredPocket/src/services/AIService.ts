import axios from 'axios';
import { StorageService } from './StorageService';

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

  static async generateText(
    prompt: string,
    systemPrompt?: string,
    imageUri?: string
  ): Promise<AIResponse> {
    try {
      const settings = await StorageService.getSettings();
      
      if (!settings.apiKey) {
        return { text: '', error: 'API key not configured. Please set your Google AI API key in Settings.' };
      }

      const contents = [];
      
      // Add system prompt if provided
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${systemPrompt}` }]
        });
      }

      // Prepare user message
      const userParts: any[] = [{ text: prompt }];
      
      // Add image if provided
      if (imageUri) {
        // Convert image to base64 (simplified - in real app you'd handle this properly)
        userParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageUri // This should be base64 encoded image data
          }
        });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      const response = await axios.post(
        `${this.GOOGLE_AI_BASE_URL}/models/${settings.selectedModel}:generateContent?key=${settings.apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: response.data.candidates[0].content.parts[0].text };
      } else {
        return { text: '', error: 'No response generated' };
      }
    } catch (error: any) {
      console.error('AI Service Error:', error);
      
      if (error.response?.status === 401) {
        return { text: '', error: 'Invalid API key. Please check your Google AI API key in Settings.' };
      } else if (error.response?.status === 429) {
        return { text: '', error: 'Rate limit exceeded. Please try again later.' };
      } else if (error.code === 'ECONNABORTED') {
        return { text: '', error: 'Request timeout. Please try again.' };
      } else {
        return { text: '', error: error.message || 'An error occurred while generating response.' };
      }
    }
  }

  static async generateImage(prompt: string): Promise<ImageGenerationResponse> {
    try {
      const settings = await StorageService.getSettings();
      
      if (!settings.apiKey) {
        return { error: 'API key not configured. Please set your Google AI API key in Settings.' };
      }

      // Note: Google AI doesn't have direct image generation API like DALL-E
      // This is a placeholder implementation
      // In a real app, you might use a different service for image generation
      // or implement image generation through a different provider
      
      const response = await axios.post(
        `${this.GOOGLE_AI_BASE_URL}/models/imagegeneration:generateImages?key=${settings.apiKey}`,
        {
          prompt,
          num_images: 1,
          size: '512x512',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (response.data?.images?.[0]?.url) {
        return { imageUri: response.data.images[0].url };
      } else {
        return { error: 'No image generated' };
      }
    } catch (error: any) {
      console.error('Image Generation Error:', error);
      
      // For now, return a placeholder since Google AI doesn't have image generation
      return { error: 'Image generation not available with current API. Please use a different service.' };
    }
  }

  static async streamText(
    prompt: string,
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    // For now, implement as regular text generation
    // In a real implementation, you'd use Server-Sent Events or WebSocket
    const response = await this.generateText(prompt, systemPrompt);
    
    if (response.text && onChunk) {
      // Simulate streaming by sending chunks
      const words = response.text.split(' ');
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          onChunk(words.slice(0, i + 1).join(' '));
        }, i * 50);
      }
    }
    
    return response;
  }

  static async summarizeText(text: string): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
    return this.generateText(prompt, 'You are a helpful assistant that creates clear, concise summaries.');
  }

  static getAvailableModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ];
  }

  static validateApiKey(apiKey: string): boolean {
    // Basic validation - starts with correct prefix and has reasonable length
    return apiKey.startsWith('AIza') && apiKey.length > 20;
  }
}
