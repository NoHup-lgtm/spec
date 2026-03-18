export interface IGhostAPI {
  // AI Communication
  sendMessage: (message: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  onStreamChunk: (callback: (chunk: string) => void) => () => void;
  clearHistory: () => Promise<{ success: boolean }>;
  listModels: () => Promise<{ success: boolean; data?: string[]; error?: string }>;

  // Window Operations
  hideWindow: () => void;
  toggleWindow: () => void;

  // Store
  getSetting: <T>(key: string) => Promise<T>;
  setSetting: <T>(key: string, value: T) => Promise<void>;
}

declare global {
  interface Window {
    ghost: IGhostAPI;
  }
}
