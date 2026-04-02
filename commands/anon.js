// commands/anon.js — Send an anonymous message to the current group
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Active anon sessions: JID → { confessTo: groupJid, text: string }
if (!global.anonSessions) global.anonSessions = new Map();

module.exports = {
    command: new Command(
        'anon',
        'Send an anonymous message to a group — your identity is hidden',
        '.anon [message]',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👤');

            const isGroup = from.endsWith('@g.us');
            const sender  = message.key.participant || message.key.remoteJid;
            const text    = args.join(' ').trim();

            // In DM: set up which group to send to, or send queued
            if (!isGroup) {
                if (!text) {
                    await reply(
                        '👤 *Anonymous Mode*\n\n' +
                        'Send an anonymous message to a group:\n\n' +
                        '1. Use `.anon [group invite link or JID]` to target a group\n' +
                        '2. Or use `.anon [message]` directly in the group you want to post in\n\n' +
                        '_Tip: Use this command directly in the group — your message will appear as_ *"Anonymous"*'
                    );
                    return;
                }

                // If they have a pending session, send to that group
                const session = global.anonSessions.get(sender);
                if (session) {
                    try {
                        await Blu3Bot.sendMessage(session.groupJid, {
                            text: `👤 *Anonymous says:*\n\n${text}`
                        });
                        // Try to delete the user's command message (requires bot admin)
                        try { await Blu3Bot.sendMessage(from, { delete: message.key }); } catch {}
                        await reply('✅ Your anonymous message was sent!');
                    } catch (err) {
                        await reply(`❌ Failed to send: ${err.message}`);
                    }
                    return;
                }

                await reply('⚠️ Use `.anon [message]` directly inside the group you want to post in.');
                return;
            }

            // In group: post the anonymous message
            if (!text) {
                await reply(
                    '👤 *Anonymous Message*\n\n' +
                    'Usage: `.anon [your message]`\n\n' +
                    '_Your identity will be hidden — only your message is shown._'
                );
                return;
            }

            // Delete the original command message first (so sender identity is hidden)
            try {
                await Blu3Bot.sendMessage(from, { delete: message.key });
            } catch {
                // Not admin — can't delete; carry on anyway with a note
            }

            // Post anonymously
            await Blu3Bot.sendMessage(from, {
                text:
                    `👤 *Anonymous says:*\n\n` +
                    `_${text}_\n\n` +
                    `> _Reply with .anon to respond anonymously_`
            });
        }
    ),
    aliases: ['anonymous', 'secret', 'confess']
};
