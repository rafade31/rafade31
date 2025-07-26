export type AIProviderType = 
  | 'google' 
  | 'openai' 
  | 'anthropic' 
  | 'cohere' 
  | 'ai_horde' 
  | 'local_server'
  | 'pollinations';

export interface AIProvider {
  id: string;
  name: string;
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  maxTokens?: number;
  supportsVision?: boolean;
  supportsImage?: boolean;
  isEnabled: boolean;
}

export interface AISettings {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  repetitionPenalty: number;
  presencePenalty: number;
  frequencyPenalty: number;
  stopSequences: string[];
  systemPrompt?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  firstMessage: string;
  exampleDialogue: string;
  avatarUri?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: Partial<AISettings>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  description: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 1024,
  repetitionPenalty: 1.1,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  stopSequences: [],
};

export const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'google-ai',
    name: 'Google AI (Gemini)',
    type: 'google',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    supportsVision: true,
    supportsImage: false,
    isEnabled: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4-vision-preview'],
    supportsVision: true,
    supportsImage: false,
    isEnabled: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    supportsVision: true,
    supportsImage: false,
    isEnabled: false,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    type: 'cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    models: ['command', 'command-r', 'command-r-plus'],
    supportsVision: false,
    supportsImage: false,
    isEnabled: false,
  },
  {
    id: 'ai-horde',
    name: 'AI Horde (Free)',
    type: 'ai_horde',
    baseUrl: 'https://horde.koboldai.net/api',
    models: ['aphrodite-mixtral-8x7b', 'llama-2-70b-chat', 'mixtral-8x7b-instruct'],
    supportsVision: false,
    supportsImage: false,
    isEnabled: false,
  },
  {
    id: 'local-server',
    name: 'Local Server',
    type: 'local_server',
    baseUrl: 'http://localhost:5000',
    models: ['local-model'],
    supportsVision: false,
    supportsImage: false,
    isEnabled: false,
  },
  {
    id: 'pollinations',
    name: 'Pollinations (Images)',
    type: 'pollinations',
    baseUrl: 'https://image.pollinations.ai',
    models: ['pollinations-xl'],
    supportsVision: false,
    supportsImage: true,
    isEnabled: true,
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    template: '### Instruction:\n{instruction}\n\n### Response:\n',
    variables: ['instruction'],
    description: 'Stanford Alpaca instruction format',
  },
  {
    id: 'chatml',
    name: 'ChatML',
    template: '<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n',
    variables: ['system', 'user'],
    description: 'OpenAI ChatML format',
  },
  {
    id: 'vicuna',
    name: 'Vicuna',
    template: 'A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user\'s questions.\n\nUSER: {user}\nASSISTANT: ',
    variables: ['user'],
    description: 'Vicuna conversation format',
  },
  {
    id: 'llama2-chat',
    name: 'Llama 2 Chat',
    template: '<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST] ',
    variables: ['system', 'user'],
    description: 'Llama 2 Chat format',
  },
];
