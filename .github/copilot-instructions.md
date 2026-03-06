# Ghost — AI Desktop Assistant

## Visão Geral do Projeto

App desktop feito com **Electron** que roda em segundo plano na bandeja do sistema. Um atalho global de teclado ativa uma janela popup translúcida onde o usuário interage com um agente de IA.

## Stack

- **Runtime**: Electron (processo main + renderer)
- **Frontend (renderer)**: React + TypeScript + TailwindCSS
- **IPC**: `ipcMain` / `ipcRenderer` com canais tipados
- **AI**: Ollama (execução local) — cliente `ollama` npm, chamado pelo processo main
- **Build**: electron-builder ou electron-vite

## Arquitetura

```
main/
  index.ts          # Entry — BrowserWindow, tray, global shortcuts
  ipc/              # Handlers de IPC (um arquivo por domínio)
  ai/               # Cliente AI, gerenciamento de contexto/histórico
  store/            # Persistência local (electron-store)
renderer/
  index.html
  App.tsx           # Root — painel de chat translúcido
  components/       # ChatInput, MessageList, etc.
shared/
  types.ts          # Tipos compartilhados entre main e renderer
```

## Convenções de Código

- TypeScript strict em todo o projeto (`"strict": true`)
- Channels IPC sempre definidos em `shared/ipc-channels.ts` como constantes — nunca strings soltas
- O processo main **nunca** importa módulos do renderer; comunicação só via IPC
- Nenhuma lógica de negócio no renderer: apenas UI + chamadas IPC
- Tratamento de erros: retornar `{ success: false, error: string }` via IPC em vez de lançar exceções cruas

## Janela Popup

- `transparent: true`, `frame: false`, `alwaysOnTop: true`
- Posicionada no centro da tela ativa no momento do atalho
- Esconde (não fecha) ao perder o foco — preserva estado do chat
- Animações de abertura/fechamento com CSS transitions (< 150ms)

## Build e Dev

```bash
npm run dev        # Electron + Vite em modo watch
npm run build      # Produção — gera instalador
npm test           # Vitest para lógica de main e shared
```

## Guias Detalhados

- Padrões Electron → `.github/instructions/electron-main.instructions.md`
- UI / Popup translúcido → `.github/instructions/ui-popup.instructions.md`
- Integração IA → `.github/instructions/ai-integration.instructions.md`
