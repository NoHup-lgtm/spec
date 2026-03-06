---
description: "Use when implementing or modifying AI chat: Ollama client (local), message history, context management, streaming responses, system prompts, or model switching. Lives exclusively in main process."
applyTo: "main/ai/**/*.ts"
---

# Integração com IA — Padrões

## Regra Principal

Toda chamada à IA acontece **exclusivamente no processo main** via **Ollama** (execução local). O renderer nunca acessa o SDK diretamente.

## Estrutura

```
main/ai/
  client.ts        # Instância do cliente Ollama
  agent.ts         # Orquestração: histórico, system prompt, streaming
  tools.ts         # Tool calls / function calling (se usar)
  types.ts         # Tipos internos do módulo AI
```

## Cliente — Ollama

```ts
// main/ai/client.ts
import { Ollama } from "ollama";
import { store } from "../store";

export const ollama = new Ollama({
  host: store.get("ollamaHost", "http://localhost:11434"),
});
```

Defaults do store (`main/store/index.ts`):

```ts
{
  ollamaHost: 'http://localhost:11434',
  model: 'llama3',
}
```

- Sem API keys — execução 100% local
- Host configurável pelo usuário, mas validado como URL local antes de usar

## Gerenciamento de Histórico

```ts
// main/ai/agent.ts
import type { ChatCompletionMessageParam } from "openai/resources";

const MAX_HISTORY = 20; // mensagens por sessão

let history: ChatCompletionMessageParam[] = [];

export function buildMessages(
  userMessage: string,
): ChatCompletionMessageParam[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY),
    { role: "user", content: userMessage },
  ];
}

export function appendToHistory(user: string, assistant: string) {
  history.push({ role: "user", content: user });
  history.push({ role: "assistant", content: assistant });
}

export function clearHistory() {
  history = [];
}
```

## Streaming de Resposta

```ts
// main/ai/agent.ts
import { IPC } from "../../shared/ipc-channels";
import { ollama } from "./client";

export async function streamResponse(
  win: BrowserWindow,
  userMessage: string,
): Promise<string> {
  const messages = buildMessages(userMessage);
  let fullText = "";

  const stream = await ollama.chat({
    model: store.get("model", "llama3"),
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.message.content;
    if (delta) {
      fullText += delta;
      win.webContents.send(IPC.AI_STREAM_CHUNK, delta);
    }
  }

  appendToHistory(userMessage, fullText);
  return fullText;
}
```

## Handler IPC para Streaming

```ts
// main/ipc/ai.ts
ipcMain.handle(IPC.AI_SEND_MESSAGE, async (_event, message: string) => {
  try {
    const win = BrowserWindow.getFocusedWindow() ?? getPopupWindow();
    await streamResponse(win!, message);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});

ipcMain.handle(IPC.AI_CLEAR_HISTORY, () => {
  clearHistory();
  return { success: true };
});
```

## System Prompt

Definir o system prompt em `main/ai/agent.ts`:

```ts
const SYSTEM_PROMPT = `
Você é Ghost, um assistente de IA integrado ao desktop do usuário.
Seja conciso e direto. Formate respostas com Markdown quando útil.
Nunca revele detalhes de implementação interna.
`.trim();
```

## Listar Modelos Disponíveis

Permitir que o usuário escolha o modelo entre os instalados no Ollama:

```ts
// main/ipc/ai.ts
ipcMain.handle(IPC.AI_LIST_MODELS, async () => {
  try {
    const { models } = await ollama.list();
    return { success: true, data: models.map((m) => m.name) };
  } catch {
    return { success: false, error: "Ollama não está em execução." };
  }
});
```

Adicionar `AI_LIST_MODELS` em `shared/ipc-channels.ts`.

## Tratamento de Erros

| Erro                    | Resposta ao renderer                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Ollama não está rodando | `{ success: false, error: 'Ollama não está em execução. Execute: ollama serve' }`   |
| Modelo não encontrado   | `{ success: false, error: 'Modelo não encontrado. Execute: ollama pull <modelo>' }` |
| Timeout / rede          | `{ success: false, error: 'Falha de conexão com o Ollama.' }`                       |

- Nunca expor stack traces ao renderer
- Logar erros completos via `electron-log`
