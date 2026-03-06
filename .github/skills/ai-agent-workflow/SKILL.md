---
name: ai-agent-workflow
description: "Skill para implementar ou modificar o agente de IA do Ghost: streaming de respostas via Ollama (local), gerenciamento de histórico, tool calls, system prompt, e contexto de conversa. Use quando precisar adicionar novas capacidades ao agente ou depurar problemas de integração com o Ollama."
argument-hint: "Descreva o que mudar no agente (ex: 'trocar modelo ollama', 'implementar tool call de busca')"
---

# Skill: AI Agent Workflow

Implementa e mantém o agente de IA no processo main do Ghost, executando **localmente via Ollama**.

## Quando Usar

- Configurar ou modificar o cliente Ollama (`main/ai/client.ts`)
- Implementar ou modificar tool calls / function calling
- Ajustar o system prompt ou o comportamento do agente
- Depurar problemas de streaming (chunks chegando fora de ordem, parando no meio)
- Gerenciar contexto: janela de histórico, limpar sessão, persistir entre sessões
- Implementar cancelamento de resposta em andamento
- Trocar ou listar modelos disponíveis no Ollama

## Procedimento

### 1. Estrutura do módulo AI

```
main/ai/
  client.ts   → instância do cliente Ollama
  agent.ts    → histórico, buildMessages(), streamResponse()
  tools.ts    → definições de tool calls (se aplicável)
  types.ts    → tipos internos
```

### 2. Configurar o cliente Ollama

O Ollama expõe uma API REST compatível com OpenAI em `http://localhost:11434`.
Usar o SDK oficial `ollama` ou o cliente `openai` apontando para o host local:

```ts
// main/ai/client.ts
import { Ollama } from "ollama";

export const ollama = new Ollama({
  host: store.get("ollamaHost", "http://localhost:11434"),
});
```

Modelo configurável pelo usuário (padrão: `llama3`):

```ts
// store default
{ ollamaHost: 'http://localhost:11434', model: 'llama3' }
```

### 3. Verificar se o Ollama está rodando

Antes de enviar mensagem, checar se o serviço está disponível:

```ts
export async function isOllamaRunning(): Promise<boolean> {
  try {
    await fetch(`${store.get("ollamaHost")}/api/tags`);
    return true;
  } catch {
    return false;
  }
}
```

Retornar erro amigável se não estiver rodando: `'Ollama não está em execução. Inicie com: ollama serve'`

### 4. Tool Calls

```ts
// main/ai/tools.ts
import type { Tool } from "ollama";

export const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Busca informações na web",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];
```

Implementar o dispatcher de tool calls em `agent.ts` após receber `finish_reason: 'tool_calls'`.

### 5. Cancelamento de Streaming

```ts
const controller = new AbortController();

// Passar signal para o fetch/stream
const stream = await ollama.chat({
  model: store.get("model", "llama3"),
  messages,
  stream: true,
  // @ts-expect-error — AbortSignal suportado internamente
  signal: controller.signal,
});

// Ao receber IPC.AI_CANCEL:
controller.abort();
```

### 6. Segurança

- Nenhuma API key necessária — execução 100% local
- Nunca expor o host do Ollama diretamente ao renderer (validar via main)
- Erros sanitizados antes de retornar ao renderer
- Validar que o `host` armazenado no store é uma URL local (`localhost` / `127.0.0.1`)

## Referências

- Padrões completos → [ai-integration.instructions.md](../../instructions/ai-integration.instructions.md)
- Canais IPC → `shared/ipc-channels.ts`
