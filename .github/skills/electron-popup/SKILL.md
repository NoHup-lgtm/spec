---
name: electron-popup
description: "Skill para criar, configurar ou depurar a janela popup translúcida do Ghost. Use quando precisar: criar BrowserWindow com transparência/glassmorphism, configurar posicionamento na tela ativa, implementar animações de abertura/fechamento, resolver problemas de foco, ou ajustar o comportamento hide-on-blur."
argument-hint: "Descreva o que precisa ajustar no popup (ex: 'adicionar animação de entrada', 'centralizar na tela ativa')"
---

# Skill: Electron Popup

Cria e configura a janela popup translúcida do Ghost no Electron.

## Quando Usar

- Criar ou modificar o `BrowserWindow` da janela popup
- Ajustar transparência, bordas, sombras (glassmorphism)
- Implementar posicionamento dinâmico (centro da tela ativa)
- Configurar comportamento de foco (esconder ao perder foco)
- Depurar problemas de `alwaysOnTop`, `skipTaskbar`, ou `frame: false`
- Adicionar animações de entrada/saída no renderer

## Procedimento

### 1. Verificar configuração base da janela

A janela popup deve ser configurada com:

```ts
new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  show: false,
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
  },
});
```

### 2. Posicionamento na tela ativa

Usar `screen.getDisplayNearestPoint(screen.getCursorScreenPoint())` para detectar o monitor ativo e centralizar.

### 3. Comportamento de foco

```ts
popup.on("blur", () => popup.hide());
```

Garantir que o estado do chat é preservado (hide, não close).

### 4. Animações

No renderer, aplicar CSS transitions entre classes `.popup-enter` e `.popup-exit-active` com duração < 150ms.

## Referências

- Padrões completos → [ui-popup.instructions.md](../../instructions/ui-popup.instructions.md)
- Configuração de segurança → [electron-main.instructions.md](../../instructions/electron-main.instructions.md)
