# BLU3BOT

A multi-functional WhatsApp bot built with Node.js and the `@whiskeysockets/baileys` library.

## Overview

BLU3BOT is a command-based WhatsApp automation bot that supports:
- AI integrations (GPT, Bard, LLaMA, DeepSeek, DALL-E)
- Media downloading (YouTube, Instagram, Facebook, Spotify, SoundCloud)
- Group management (kick, promote, demote, tag all, open/close group)
- Utility commands (ping, news, crypto prices, weather, lyrics, etc.)
- Auto-features (auto-read, auto-view, anti-link, anti-delete, chatbot)

## Tech Stack

- **Runtime**: Node.js 20
- **WhatsApp Library**: `@whiskeysockets/baileys`
- **Package Manager**: npm
- **Key Dependencies**: `chalk`, `dotenv`, `moment`, `pino`, `qrcode-terminal`, `axios`, `yt-search`

## Project Structure

```
/
├── index.js              # Main entry point
├── commandHandler.js     # Command loading and execution logic
├── commands/             # Individual command modules (84 commands)
├── BLU3BOT/              # Alternative bot version (more advanced)
│   ├── index.js
│   ├── commandHandler.js
│   └── ultimatefix.js
├── package.json
└── session/              # WhatsApp session files (auto-created, gitignored)
```

## Running the Bot

The bot is started via the "Start application" workflow (`node index.js`).

On first run, a QR code is printed to the console. Scan it with WhatsApp to authenticate.

## Configuration

Environment variables (via `.env` or Replit Secrets):
- `PREFIX` - Command prefix (default: `.`)
- `BOT_NAME` - Bot display name (default: `BLU3BOT`)
- `BOT_VERSION` - Version string (default: `2.0.0`)
- `OWNER_NUMBER` - Owner's WhatsApp number without `+` (default: `254118402996`)
- `MODE` - Bot mode: `public` or `private` (default: `public`)

## Session Management

WhatsApp session data is stored in the `./session/` directory (excluded from git). If the bot is logged out, the session folder is cleared automatically and a new QR code is generated.
