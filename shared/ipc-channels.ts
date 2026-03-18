export const IPC = {
  // AI Operations
  AI_SEND_MESSAGE: 'ai:sendMessage',
  AI_STREAM_CHUNK: 'ai:streamChunk',
  AI_CLEAR_HISTORY: 'ai:clearHistory',
  AI_LIST_MODELS: 'ai:listModels',

  // Window Management
  WINDOW_HIDE: 'window:hide',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_READY: 'window:ready',

  // Configuration
  STORE_GET: 'store:get',
  STORE_SET: 'store:set'
} as const;

export type IPCChannels = typeof IPC[keyof typeof IPC];
