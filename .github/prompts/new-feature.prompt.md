---
description: "Add a new feature end-to-end to the Ghost app: IPC channel, main handler, renderer hook, and UI component"
argument-hint: "Describe the feature (e.g. 'history export to clipboard')"
agent: "agent"
---

Implemente a funcionalidade descrita abaixo no app Ghost (Electron + React + TypeScript) seguindo as convenções do projeto.

**Funcionalidade**: $input

## Etapas obrigatórias

### 1. Canal IPC (`shared/ipc-channels.ts`)

- Adicionar nova(s) constante(s) no objeto `IPC`
- Seguir o padrão de nomenclatura `domínio:ação` (ex: `history:export`)

### 2. Handler no Main (`main/ipc/<domínio>.ts`)

- Criar ou atualizar o arquivo de handlers correspondente
- Usar `ipcMain.handle` com retorno `{ success: boolean; data?: T; error?: string }`
- Registrar o handler em `main/index.ts`

### 3. Preload (`main/preload.ts`)

- Expor a nova API via `contextBridge.exposeInMainWorld('ghost', { ... })`
- Atualizar a declaração de tipos em `renderer/types/electron.d.ts`

### 4. Hook React (`renderer/hooks/use<Feature>.ts`)

- Encapsular a chamada `window.ghost.<método>` em um hook customizado
- Gerenciar estados de loading e erro

### 5. Componente / UI

- Integrar o hook no componente relevante
- Manter glassmorphism e estilos Tailwind existentes

### 6. Testes

- Adicionar teste Vitest para a lógica do handler no main (mock de IPC)

Siga os padrões de `.github/instructions/electron-main.instructions.md` e `.github/instructions/ui-popup.instructions.md`.
