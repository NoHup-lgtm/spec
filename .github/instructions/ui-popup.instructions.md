---
description: "Use when working on the renderer, React components, translucent popup, chat UI, animations, TailwindCSS styling, or preload script. Covers glassmorphism design, focus behavior, and accessibility."
applyTo: "renderer/**/*.{ts,tsx,css}"
---

# UI / Popup Translúcido — Padrões

## BrowserWindow — Config do Popup

```ts
const popup = new BrowserWindow({
  width: 680,
  height: 520,
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  resizable: false,
  show: false, // mostrar só após 'ready-to-show'
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    preload: path.join(__dirname, "preload.js"),
  },
});

popup.once("ready-to-show", () => popup.show());

// Esconder ao perder foco (não fechar)
popup.on("blur", () => popup.hide());
```

## Posicionamento — Centro da Tela Ativa

```ts
import { screen } from "electron";

function centerOnActiveScreen(win: BrowserWindow) {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const { x, y, width, height } = display.workArea;
  const [w, h] = win.getSize();
  win.setPosition(
    Math.round(x + (width - w) / 2),
    Math.round(y + (height - h) / 2),
  );
}
```

Chamar `centerOnActiveScreen` antes de `win.show()`.

## Glassmorphism — TailwindCSS

Classes base para o painel de chat:

```tsx
// renderer/components/ChatPanel.tsx
<div className="
  w-full h-full
  bg-black/40 backdrop-blur-xl
  border border-white/10
  rounded-2xl shadow-2xl
  flex flex-col overflow-hidden
">
```

- Fundo: `bg-black/40` ou `bg-white/10` conforme tema
- Blur: `backdrop-blur-xl` (16px)
- Borda sutil: `border border-white/10`
- Nunca usar `bg-opacity` legado — usar slash notation

## Animações de Abertura / Fechamento

```css
/* renderer/styles/popup.css */
.popup-enter {
  opacity: 0;
  transform: scale(0.96) translateY(-6px);
}
.popup-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}
.popup-exit-active {
  opacity: 0;
  transform: scale(0.96) translateY(-6px);
  transition:
    opacity 100ms ease-in,
    transform 100ms ease-in;
}
```

- Total de animação: < 150ms
- Usar `react-transition-group` ou CSS puro — evitar framer-motion para manter bundle leve

## Estrutura de Componentes

```
renderer/components/
  ChatPanel.tsx      # Container principal (glassmorphism)
  MessageList.tsx    # Lista de mensagens com scroll
  MessageItem.tsx    # Bolha individual de mensagem
  ChatInput.tsx      # Input + botão enviar
  StatusBar.tsx      # Modelo ativo, loading indicator
```

## Input e Envio

```tsx
// Enviar com Enter, nova linha com Shift+Enter
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
};
```

- Foco automático no input ao abrir o popup
- Limpar input após envio
- Desabilitar input durante streaming

## Preload Script

```ts
// main/preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../shared/ipc-channels";

contextBridge.exposeInMainWorld("ghost", {
  sendMessage: (msg: string) => ipcRenderer.invoke(IPC.AI_SEND_MESSAGE, msg),
  onStreamChunk: (cb: (chunk: string) => void) =>
    ipcRenderer.on(IPC.AI_STREAM_CHUNK, (_e, chunk) => cb(chunk)),
  clearHistory: () => ipcRenderer.invoke(IPC.AI_CLEAR_HISTORY),
  hideWindow: () => ipcRenderer.send(IPC.WINDOW_HIDE),
});
```

Declaração de tipos em `renderer/types/electron.d.ts`:

```ts
interface Window {
  ghost: {
    sendMessage: (
      msg: string,
    ) => Promise<{ success: boolean; data?: string; error?: string }>;
    onStreamChunk: (cb: (chunk: string) => void) => void;
    clearHistory: () => Promise<void>;
    hideWindow: () => void;
  };
}
```
