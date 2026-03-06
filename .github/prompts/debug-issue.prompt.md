---
description: "Debug an issue in the Ghost Electron app: diagnose IPC failures, renderer errors, AI streaming problems, window behavior, or native crashes"
argument-hint: "Describe the problem or paste the error"
agent: "agent"
---

Analise e corrija o problema descrito abaixo no app Ghost (Electron + React + TypeScript).

**Problema**: $input

## Roteiro de Diagnóstico

### 1. Classificar o problema

Identificar onde está a falha:

- **Main process** (`main/`): crash, IPC não responde, atalho não registra, tray falha
- **Renderer** (`renderer/`): UI quebrada, estado desatualizado, erro React
- **IPC**: mensagem não chega, tipo incorreto, canal errado
- **AI** (`main/ai/`): streaming falha, histórico corrompido, erro de API
- **Janela**: popup não abre/fecha, posicionamento errado, foco incorreto

### 2. Verificar

- Checar se o canal IPC está definido em `shared/ipc-channels.ts`
- Confirmar que o handler está registrado em `main/index.ts`
- Confirmar que a API está exposta no preload e tipada em `renderer/types/electron.d.ts`
- Verificar retorno `{ success, data, error }` — nunca lançar exceção crua via IPC

### 3. Corrigir

- Aplicar a correção mínima necessária
- Não refatorar código não relacionado ao problema
- Adicionar ou atualizar teste Vitest se a correção envolver lógica no main

### 4. Validar

- Descrever como reproduzir o problema antes da correção
- Confirmar que o comportamento esperado é atingido após a correção

Siga os padrões de segurança de `.github/instructions/electron-main.instructions.md`.
