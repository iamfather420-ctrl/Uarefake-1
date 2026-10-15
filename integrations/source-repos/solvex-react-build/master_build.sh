#!/bin/bash

# 1. Force Node.js 24 environment for current session
export FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true

# 2. Re-verify CSS integrity (Manual fix for @import order)
# Ensures the import is the very first line to prevent build-time warnings
echo '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600&display=swap");

:root {
  --color-obsidian: #0a0a0a;
}

body {
  background-color: var(--color-obsidian);
  margin: 0;
  padding: 0;
  font-family: "Inter", sans-serif;
}' > src/index.css

# 3. Clean environment and perform install with legacy bypass
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 4. Trigger production build
npm run build

