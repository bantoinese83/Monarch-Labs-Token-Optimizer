/**
 * Maps model keys to their logo file paths
 */
export function getModelLogo(modelKey: string): string | null {
  const logoMap: Record<string, string> = {
    // OpenAI Models
    'gpt-4': '/openai.svg',
    'gpt-4-turbo': '/openai.svg',
    'gpt-3.5-turbo': '/openai.svg',
    'gpt-5-nano': '/openai.svg',
    
    // Anthropic Claude Models
    'claude-3-opus': '/claude-color.svg',
    'claude-3-sonnet': '/claude-color.svg',
    'claude-3-haiku': '/claude-color.svg',
    
    // Google Gemini Models
    'gemini-pro': '/gemini-color.svg',
    'gemini-2.5-pro': '/gemini-color.svg',
    'gemini-2.5-flash': '/gemini-color.svg',
    
    // Qwen Models
    'qwen-2.5-vl-7b-instruct': '/qwen-color.svg',
    
    // Meta Llama Models (Ollama)
    'llama-3.1-8b-instruct': '/ollama.svg',
    
    // THUDM GLM Models
    'glm-4-9b-0414': '/chatglm-color.svg',
    
    // DeepSeek Models
    'deepseek-r1': '/deepseek-color.svg',
  };

  return logoMap[modelKey] || null;
}

/**
 * Gets the provider name for a model key
 */
export function getModelProvider(modelKey: string): string {
  if (modelKey.startsWith('gpt')) return 'OpenAI';
  if (modelKey.startsWith('claude')) return 'Anthropic';
  if (modelKey.startsWith('gemini')) return 'Google';
  if (modelKey.startsWith('qwen')) return 'Qwen';
  if (modelKey.startsWith('llama')) return 'Meta';
  if (modelKey.startsWith('glm')) return 'GLM';
  if (modelKey.startsWith('deepseek')) return 'DeepSeek';
  return 'Unknown';
}

