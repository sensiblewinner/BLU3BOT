// commands/setname.js — Change bot WhatsApp display name + internal BOT_NAME
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'setname',
        "Change the bot's WhatsApp display name and internal bot name",
        '.setname [new name]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✏️');

            const newName = args.join(' ').trim();
            const oldName = global.BOT_NAME || process.env.BOT_NAME || 'BLU3BOT';

            if (!newName) {
                await reply(
                    `✏️ *Set Bot Name*\n\n` +
                    `Current name: *${oldName}*\n\n` +
                    `Usage: \`.setname [new name]\`\n` +
                    `Example: \`.setname BLU3BOT v2\``
                );
                return;
            }

            if (newName.length > 25) {
                await reply('⚠️ Name too long. WhatsApp limits names to 25 characters.');
                return;
            }

            const errors = [];

            // 1. Update WhatsApp profile name
            try {
                await Blu3Bot.updateProfileName(newName);
            } catch (err) {
                errors.push(`WA profile: ${err.message}`);
            }

            // 2. Update internal global
            global.BOT_NAME = newName;

            // 3. Persist to env-like global so restarts see it
            process.env.BOT_NAME = newName;

            if (errors.length) {
                await reply(
                    `⚠️ *Partial Update*\n\n` +
                    `✅ Internal name updated to *${newName}*\n` +
                    `❌ WhatsApp profile name failed (may need Business account)\n\n` +
                    `Error: ${errors[0]}`
                );
            } else {
                await react('✅');
                await reply(
                    `✅ *Bot Name Updated*\n\n` +
                    `Old: ${oldName}\n` +
                    `New: *${newName}*\n\n` +
                    `_Both WhatsApp profile and internal name changed._`
                );
            }
        }
    ),
    ownerOnly: true,
    aliases: ['botname', 'changebotname', 'renamebotname']
};
