# Custom Mini Keypad Manager

Desktop interface for configuring shortcuts, actions, and LED behavior for a custom mini keypad with 6 keys and 1 rotary dial.

![Custom keypad](docs/keypad.png)

## Overview

Custom Mini Keypad Manager is a React + Tauri app for designing a local keypad profile. The current interface lets you select each key or dial action, assign a command, tune LED settings, and keep the configuration saved on the computer.

USB synchronization is not implemented yet. For now, profiles are persisted locally in the browser/app storage.

## Requirements

- Node.js and npm
- Rust toolchain
- Tauri system dependencies for your operating system

For Tauri setup details, see the official Tauri prerequisites guide:
https://tauri.app/start/prerequisites/

## Getting Started

Install dependencies:

```bash
npm install
```

Run the web app during development:

```bash
npm run dev
```

Run the desktop app with Tauri:

```bash
npm run tauri:dev
```

Build the frontend:

```bash
npm run build
```

Build the desktop bundle:

```bash
npm run tauri:build
```
