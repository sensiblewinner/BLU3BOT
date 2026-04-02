// commandHandler.js - PERMANENT FIX VERSION
const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.categories = new Map();
        this.cooldowns = new Map();
        this.loadedCount = 0;
    }

    // Load all commands from commands folder
    loadCommands(commandsDir) {
        console.log('🎩 CommandHandler: Scanning for commands...');
        
        try {
            if (!fs.existsSync(commandsDir)) {
                console.log('❌ Commands folder not found! Creating...');
                fs.mkdirSync(commandsDir, { recursive: true });
                return;
            }

            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
            console.log('📂 Files found:', files);
            
            this.loadedCount = 0;
            let skippedCount = 0;

            files.forEach(file => {
                try {
                    const commandPath = path.join(commandsDir, file);
                    console.log(`🔍 Loading: ${file}`);
                    
                    // Clear cache and load
                    delete require.cache[require.resolve(commandPath)];
                    const commandModule = require(commandPath);
                    
                    // Register if valid command
                    if (commandModule.command && commandModule.command.name) {
                        if (commandModule.ownerOnly) {
                            commandModule.command.ownerOnly = true;
                        }
                        if (commandModule.stealth) {
                            commandModule.command.stealth = true;
                        }
                        if (commandModule.aliases) {
                            commandModule.command.aliases = commandModule.command.aliases || commandModule.aliases;
                        }
                        this.register(commandModule.command);
                        const flags = [
                            commandModule.command.ownerOnly ? 'OWNER ONLY' : '',
                            commandModule.command.stealth ? 'STEALTH' : ''
                        ].filter(Boolean).join(' | ');
                        console.log(`✅ Registered: ${commandModule.command.name}${flags ? ` (${flags})` : ''}`);
                        this.loadedCount++;
                    } else if (commandModule.name && commandModule.execute) {
                        this.register(commandModule);
                        console.log(`✅ Registered: ${commandModule.name} (direct format)`);
                        this.loadedCount++;
                    } else if (Array.isArray(commandModule)) {
                        commandModule.forEach(cmd => {
                            if (cmd && cmd.name) {
                                this.register(cmd);
                                console.log(`✅ Registered: ${cmd.name} (array format)`);
                                this.loadedCount++;
                            }
                        });
                    } else {
                        console.log(`⏭️  Skipping ${file}: Not a valid command format`);
                        skippedCount++;
                    }
                    
                } catch (error) {
                    console.error(`❌ Failed to load ${file}:`, error.message);
                }
            });

            console.log(`✨ CommandHandler: Loaded ${this.loadedCount} commands, skipped ${skippedCount} files`);
            console.log(`📋 Available commands:`, Array.from(this.commands.keys()));
            
        } catch (error) {
            console.error('❌ CommandHandler Error:', error.message);
        }
    }

    // Register a single command
    register(command) {
        if (!command || !command.name) {
            console.log('❌ Cannot register: Invalid command object');
            return;
        }
        
        this.commands.set(command.name.toLowerCase(), command);
        console.log(`📝 Registered command: ${command.name}`);
        
        // Register aliases
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
                console.log(`   ↳ Alias: ${alias} -> ${command.name}`);
            });
        }
        
        // Categorize
        const category = command.category || 'General';
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        this.categories.get(category).push(command);
    }

    // Execute a command - FIXED OWNER CHECK
    async executeCommand(commandText, context) {
        const { from, message, pushName, sender, prefix, Blu3Bot, config } = context;
        
        const args = commandText.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        console.log(`⚡ Command detected: "${commandName}"`);
        console.log(`📊 Total commands available: ${this.commands.size}`);
        console.log(`🔍 Command exists: ${this.commands.has(commandName)}`);
        console.log(`👤 Sender: ${sender}`);
        console.log(`💬 Chat Type: ${from.endsWith('@g.us') ? 'GROUP' : 'DM'}`);

        // Find command (check aliases too)
        let command = this.commands.get(commandName);
        if (!command && this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
            console.log(`🔍 Found via alias: ${commandName} -> ${command.name}`);
        }

        if (!command) {
            console.log(`❌ Command not found: ${commandName}`);
            throw new Error(`Command "${commandName}" not found. Use .menu to see available commands.`);
        }

        // Build owner JID for stealth delivery — always ensure @s.whatsapp.net suffix
        const rawOwner = (config?.OWNER_NUMBER || sender)
            .replace('@s.whatsapp.net', '')
            .replace('@c.us', '')
            .trim();
        const ownerJid = `${rawOwner}@s.whatsapp.net`;

        // Stealth commands: all output goes silently to owner's personal DM only
        const isStealthCommand = command.stealth === true;

        const reply = isStealthCommand
            ? (text) => Blu3Bot.sendMessage(ownerJid, { text })
            : (text) => Blu3Bot.sendMessage(from, { text }, { quoted: message });

        // Stealth: suppress all visible reactions in the current chat
        const react = isStealthCommand
            ? () => Promise.resolve()
            : (emoji) => {
                try {
                    return Blu3Bot.sendMessage(from, {
                        react: { text: emoji, key: message.key }
                    });
                } catch (error) {
                    console.log('⚠️ React failed:', error.message);
                }
            };

        // ✅ PERMANENT FIX - OWNER CHECK THAT ALWAYS WORKS
        if (command.ownerOnly) {
            const isOwner = this.isOwner(sender, config);
            console.log(`🔐 Owner check for ${command.name}: ${isOwner}`);

            if (!isOwner) {
                console.log(`🚫 Owner blocked: ${sender} tried ${command.name}`);
                // Don't reveal the block in stealth commands
                if (!isStealthCommand) {
                    await Blu3Bot.sendMessage(from, { text: '❌ This command is for bot owner only!' }, { quoted: message });
                }
                return;
            }
        }

        // Check cooldown
        if (this.isOnCooldown(sender, command.name)) {
            if (!isStealthCommand) {
                await Blu3Bot.sendMessage(from, { text: `⏳ Please wait before using .${command.name} again` }, { quoted: message });
            }
            return;
        }

        this.setCooldown(sender, command.name, 3000);

        try {
            console.log(`🎯 Executing command: ${command.name} in ${from.endsWith('@g.us') ? 'GROUP' : 'DM'} [stealth: ${isStealthCommand}]`);
            await command.execute(reply, react, from, message, args, Blu3Bot, { ...context, commandName, ownerJid });
            console.log(`✅ Command executed successfully: ${command.name}`);
        } catch (error) {
            console.error(`❌ Command execution failed [${command.name}]:`, error);
            if (!isStealthCommand) {
                await Blu3Bot.sendMessage(from, { text: `❌ Command failed: ${error.message}` }, { quoted: message });
            }
            throw error;
        }
    }

    // ✅ BULLETPROOF OWNER CHECK — reads OWNER_NUMBER from runtime config
    isOwner(sender, config) {
        if (!sender) {
            console.log('❌ Owner check: No sender provided');
            return false;
        }

        console.log(`🔍 Owner Check - Sender: ${sender}`);

        // Extract the raw number from config (strip @s.whatsapp.net if present)
        const ownerFromConfig = (config?.OWNER_NUMBER || '')
            .replace('@s.whatsapp.net', '')
            .replace('@c.us', '')
            .trim();

        // Normalize sender the same way
        const senderNorm = sender
            .replace('@s.whatsapp.net', '')
            .replace('@c.us', '')
            .split(':')[0]
            .trim();

        const isOwner = senderNorm === ownerFromConfig || senderNorm.includes(ownerFromConfig);

        console.log(`🔐 Owner Check — Sender: ${senderNorm} | Owner: ${ownerFromConfig} | Result: ${isOwner}`);
        return isOwner;
    }

    // Cooldown management
    setCooldown(userId, commandName, cooldownTime = 3000) {
        const key = `${userId}-${commandName}`;
        this.cooldowns.set(key, Date.now() + cooldownTime);
        setTimeout(() => this.cooldowns.delete(key), cooldownTime);
    }

    isOnCooldown(userId, commandName) {
        const key = `${userId}-${commandName}`;
        const cooldownEnd = this.cooldowns.get(key);
        return cooldownEnd && Date.now() < cooldownEnd;
    }

    // Get commands for menu
    getAllCommands() {
        const commands = Array.from(this.commands.values());
        return commands;
    }

    getCommandsByCategory() {
        const categorized = {};
        this.categories.forEach((commands, category) => {
            categorized[category] = commands;
        });
        return categorized;
    }

    getCommandCount() {
        return this.commands.size;
    }

    // Utility methods
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = CommandHandler;