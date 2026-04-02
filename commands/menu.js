// commands/menu.js - CENTERED SIMPLE BORDER (PATCHED & SAFE)

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const fs = require('fs');
const path = require('path');

module.exports = {
    command: new Command(
        'menu',
        'Show command menu',
        '.menu',
        'general',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📋');
            console.log('🎯 Menu command executed');

            // HARD SAFETY CHECK
            if (!global.commandHandler) {
                await reply('❌ Command handler not initialized.');
                return;
            }

            try {
                /* ================= AUTO-REFRESH ================= */
                const commandsDir = path.join(__dirname, '..', 'commands');
                const files = fs.existsSync(commandsDir)
                    ? fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))
                    : [];

                let shouldReload = false;

                files.forEach(file => {
                    const cmdName = file.replace('.js', '');
                    if (!global.commandHandler.commands?.has(cmdName)) {
                        console.log(`🆕 New command detected: ${file}`);
                        shouldReload = true;
                    }
                });

                if (shouldReload) {
                    console.log('🔄 Auto-reloading commands...');
                    global.commandHandler.commands?.clear();
                    global.commandHandler.aliases?.clear();
                    global.commandHandler.categories?.clear();
                    global.commandHandler.loadCommands(commandsDir);
                }

                /* ================= SAFE FETCH ================= */
                const commands = global.commandHandler.getAllCommands?.() || [];
                const categories = global.commandHandler.getCommandsByCategory?.() || {};

                /* ================= HEADER ================= */
                let menuText = `
+------------------------------+
|         🧩 BLU3BOT MENU       |
+------------------------------+
| 👤 Owner  : Brandon
| 🔧 Prefix : [ ${context?.config?.PREFIX || '.'} ]
| 🖥️ Host   : Panel
| 📦 Plugins: ${commands.length}
| 🌐 Mode   : ${context?.config?.MODE || 'Public'}
| 🧬 Version: ${context?.config?.BOT_VERSION || '2.0.0'}
| ⚡ Speed  : 0.${Math.floor(Math.random() * 9999)} ms
| 💾 Usage  : ${Math.floor(Math.random() * 500) + 100} MB / 8 GB
| 🟩 RAM    : [████████░░] 80%
+------------------------------+

`;

                /* ================= CATEGORY ORDER ================= */
                const categoryOrder = [
                    'download', 'music', 'ai', 'search',
                    'media', 'tools', 'general', 'fun',
                    'utility', 'owner', 'group', 'settings'
                ];

                let hasContent = false;

                /* ================= CATEGORIES ================= */
                for (const category of categoryOrder) {
                    if (
                        categories[category] &&
                        Array.isArray(categories[category]) &&
                        categories[category].length > 0
                    ) {
                        hasContent = true;
                        const categoryName = getCategoryDisplayName(category);

                        menuText += `
+------------------------------+
|        🔹 ${categoryName} 🔹
+------------------------------+
`;

                        try {
                            const cmds = [...categories[category]].sort(
                                (a, b) => a.name.localeCompare(b.name)
                            );

                            for (const cmd of cmds) {
                                if (cmd?.name) {
                                    menuText += `| › ${cmd.name}\n`;
                                }
                            }
                        } catch (catErr) {
                            console.log(`⚠️ Category error (${category}):`, catErr);
                            menuText += `| ⚠️ Error loading commands\n`;
                        }

                        menuText += `+------------------------------+\n`;
                    }
                }

                /* ================= EMPTY STATE ================= */
                if (!hasContent) {
                    menuText += `
+------------------------------+
|        ⚠️ NO COMMANDS        |
+------------------------------+
|   Command list unavailable   |
|   Check console logs         |
+------------------------------+
`;
                }

                /* ================= RELOAD NOTICE ================= */
                if (shouldReload) {
                    menuText += `
+------------------------------+
|   🔄 Commands Auto-Reloaded   |
+------------------------------+
`;
                }

                /* ================= SEND ================= */
                try {
                    await Blu3Bot.sendMessage(
                        from,
                        {
                            image: { url: 'https://i.ibb.co/0phhSQc9/BLU3BOT.jpg' },
                            caption: menuText
                        },
                        { quoted: message }
                    );
                } catch (imgErr) {
                    console.log('🖼️ Image failed, sending text only.');
                    await reply(menuText);
                }

            } catch (error) {
                console.log('❌ Menu fatal error:', error);

                /* ================= FAILSAFE ================= */
                const allCommands = global.commandHandler?.commands
                    ? Array.from(global.commandHandler.commands.keys()).sort()
                    : [];

                let failMenu = `
+------------------------------+
|       🔧 BLU3BOT FAILSAFE     |
+------------------------------+
| Mode  : ${context?.config?.MODE || 'Public'}
| Total : ${allCommands.length}
+------------------------------+

+------------------------------+
|        ALL COMMANDS          |
+------------------------------+
`;

                for (const cmd of allCommands) {
                    failMenu += `| › ${cmd}\n`;
                }

                failMenu += `+------------------------------+\n`;

                await reply(failMenu);
            }
        }
    )
};

/* ================= CATEGORY NAME MAP ================= */
function getCategoryDisplayName(category) {
    const names = {
        owner: 'OWNER',
        general: 'GENERAL',
        tools: 'TOOLS',
        group: 'GROUP',
        download: 'DOWNLOAD',
        media: 'MEDIA',
        music: 'MUSIC',
        ai: 'AI',
        fun: 'FUN',
        search: 'SEARCH',
        utility: 'UTILITY',
        settings: 'SETTINGS'
    };
    return names[category] || category.toUpperCase();
}