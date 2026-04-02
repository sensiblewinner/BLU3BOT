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

## Command Status & Bug Fixes

All 84 commands load and run cleanly. Key fixes applied across two rounds of audit:

### Core Bug (fixed in all affected commands)
`reply()` is text-only — it calls `Blu3Bot.sendMessage(from, { text }, { quoted })`. Any command sending images, videos, audio, polls, or mentions-with-text was patched to call `Blu3Bot.sendMessage(from, { ... }, { quoted: message })` directly.

Fixed files: `download.js`, `aiimg.js`, `enhance.js`, `comics.js`, `gay.js`, `screenshot.js`, `shazam.js`, `poll.js`, `report.js`, `getprofile.js`, `block.js`, `kick.js`, `instastory.js`, `spotify.js`, `tagall.js`

### Individual Fixes
- `ping.js` — `{ping}` template literal was not substituted; replaced with `${latency}`, and also shows RAM & uptime
- `news.js` — fake newsapi.org key removed; now uses BBC RSS via rss2json with Hacker News fallback (both free, no key needed)
- `dalle.js` — fake Pexels key removed; now uses Pollinations.ai (completely free, no key, generates real AI images)
- `catbox.js` — placeholder stub replaced with real Catbox.moe upload using multipart form upload
- `music.js` — placeholder stub replaced with real YouTube search via `yt-search`
- `chat.js` — hardcoded random responses replaced with real free AI API calls with conversation history
