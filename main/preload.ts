import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IPC } from '../shared/ipc-channels'

// Exposing the ghost API to the renderer process
contextBridge.exposeInMainWorld('ghost', {
  // AI Communication
  sendMessage: (message: string) => ipcRenderer.invoke(IPC.AI_SEND_MESSAGE, message),
  onStreamChunk: (callback: (chunk: string) => void) => {
    const listener = (_event: IpcRendererEvent, chunk: string) => callback(chunk);
    ipcRenderer.on(IPC.AI_STREAM_CHUNK, listener);
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC.AI_STREAM_CHUNK, listener);
  },
  clearHistory: () => ipcRenderer.invoke(IPC.AI_CLEAR_HISTORY),
  listModels: () => ipcRenderer.invoke(IPC.AI_LIST_MODELS),

  // Window Operations
  hideWindow: () => ipcRenderer.send(IPC.WINDOW_HIDE),
  toggleWindow: () => ipcRenderer.send(IPC.WINDOW_TOGGLE),

  // Store
  getSetting: (key: string) => ipcRenderer.invoke(IPC.STORE_GET, key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke(IPC.STORE_SET, key, value)
})
