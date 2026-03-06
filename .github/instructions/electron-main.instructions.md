---
description: "Use when working on the Electron main process: BrowserWindow, system tray, global shortcuts, IPC handlers, app lifecycle, native APIs. Covers security, IPC channel conventions, process isolation."
applyTo: "main/**/*.ts"
---

# Electron Main Process — Padrões

## Segurança (obrigatório)

```ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true, // SEMPRE true
    nodeIntegration: false, // SEMPRE false
    sandbox: true,
    preload: path.join(__dirname, "preload.js"),
  },
});
```

- Nunca desabilitar `contextIsolation` ou habilitar `nodeIntegration`
- Usar `preload.ts` para expor APIs controladas ao renderer via `contextBridge`
- Validar todos os dados recebidos via IPC antes de usar

## IPC — Canais e Handlers

Canais definidos em `shared/ipc-channels.ts`:

```ts
// shared/ipc-channels.ts
export const IPC = {
  AI_SEND_MESSAGE: "ai:sendMessage",
  AI_STREAM_CHUNK: "ai:streamChunk",
  AI_CLEAR_HISTORY: "ai:clearHistory",
  WINDOW_HIDE: "window:hide",
  WINDOW_TOGGLE: "window:toggle",
} as const;
```

Handler padrão no main:

```ts
// main/ipc/ai.ts
ipcMain.handle(IPC.AI_SEND_MESSAGE, async (_event, message: string) => {
  try {
    const response = await aiClient.send(message);
    return { success: true, data: response };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});
```

- Retorno sempre `{ success: boolean; data?: T; error?: string }`
- Um arquivo por domínio em `main/ipc/`
- Registrar handlers em `main/index.ts` via funções `register*Handlers()`

## Atalho Global

```ts
// main/index.ts
app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+Shift+Space", () => {
    togglePopupWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
```

- Sempre desregistrar no `will-quit`
- Permitir que o atalho seja configurável pelo usuário via `electron-store`

## System Tray

```ts
const tray = new Tray(nativeImage.createFromPath(iconPath));
tray.setContextMenu(
  Menu.buildFromTemplate([
    { label: "Abrir Ghost", click: () => popup.show() },
    { type: "separator" },
    { label: "Sair", click: () => app.quit() },
  ]),
);
tray.on("click", () => togglePopupWindow());
```

- Nunca fechar a app ao clicar no X — usar `win.on('close', (e) => { e.preventDefault(); win.hide() })`
- Encerrar apenas via `app.quit()` (menu da tray ou atalho)

## Ciclo de Vida

```ts
app.on("window-all-closed", (e) => {
  e.preventDefault(); // Manter rodando em background
});
```

## Persistência — electron-store

```ts
import Store from "electron-store";

const store = new Store<AppConfig>({
  defaults: { shortcut: "CommandOrControl+Shift+Space", model: "gpt-4o" },
});
```

- Centralizar em `main/store/index.ts`
- Sempre tipar o schema do store
