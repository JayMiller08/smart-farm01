/**
 * OpenRouter API Service
 * 
 * This service handles AI chat completions using the OpenRouter API.
 * 
 * Note: In production, move API key to environment variables:
 * - VITE_OPENROUTER_API_KEY
 * - VITE_OPENROUTER_BASE_URL
 */

// API Configuration
const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  model: 'gpt-4o-mini',
};

// Types for OpenRouter API
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterChatCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface OpenRouterChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}

class OpenRouterApiService {
  /**
   * Create a chat completion using OpenRouter API
   */
  async createChatCompletion(
    messages: OpenRouterMessage[],
    options?: {
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<OpenRouterChatCompletionResponse> {
    try {
      const requestBody: OpenRouterChatCompletionRequest = {
        model: OPENROUTER_CONFIG.model,
        messages,
        max_tokens: options?.max_tokens || 1000,
        temperature: options?.temperature || 0.7,
        stream: options?.stream || false,
      };

      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Smart Farm AI Advisor',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API request failed: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`
        );
      }

      const data: OpenRouterChatCompletionResponse = await response.json();
      return data;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to get AI response from OpenRouter API'
      );
    }
  }

  /**
   * Send a user message and get AI response
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: OpenRouterMessage[] = [],
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Prepare messages array
      const messages: OpenRouterMessage[] = [];
      
      // Add system prompt if provided
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Add conversation history
      messages.push(...conversationHistory);

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      // Get AI response
      const response = await this.createChatCompletion(messages, {
        max_tokens: 1000,
        temperature: 0.7,
      });

      // Extract the assistant's message
      const assistantMessage = response.choices[0]?.message?.content;
      
      if (!assistantMessage) {
        throw new Error('No response received from AI');
      }

      return assistantMessage;
    } catch (error) {
      console.error('Error sending message to OpenRouter:', error);
      throw error;
    }
  }

  /**
   * Get a farming-specific AI response
   */
  async getFarmingAdvice(
    question: string,
    conversationHistory: OpenRouterMessage[] = []
  ): Promise<string> {
    const systemPrompt = `You are an expert AI farming advisor specializing in smart agriculture, crop management, and sustainable farming practices. You provide practical, science-based advice for farmers in Africa and other regions.

Key areas of expertise:
- Crop planning and timing
- Soil health and management
- Irrigation and water management
- Pest and disease identification
- Weather and climate considerations
- Fertilizer and nutrient management
- Sustainable farming practices
- Technology integration in agriculture

Guidelines:
- Provide specific, actionable advice
- Consider local climate and conditions when possible
- Use simple, clear language that farmers can understand
- Suggest practical solutions and alternatives
- Ask clarifying questions when needed
- Be encouraging and supportive
- Reference modern farming techniques and technology when relevant

Always be helpful, accurate, and focused on practical farming solutions.`;

    return this.sendMessage(question, conversationHistory, systemPrompt);
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.createChatCompletion([
        {
          role: 'user',
          content: 'Hello, how are you?',
        },
      ], {
        max_tokens: 50,
        temperature: 0.5,
      });

      return response.choices.length > 0 && !!response.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openRouterApiService = new OpenRouterApiService();
