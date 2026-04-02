// commands/bug.js — Repeatedly ping/message a target to annoy them
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.bugSessions) global.bugSessions = new Map(); // sender → { active, target }

// Rotating messages sent to the target
const BUG_MESSAGES = [
    '📳 *You have a notification!*',
    '🔔 *PING!*',
    '👋 Hey, you there?',
    '📲 *Someone is trying to reach you!*',
    '🚨 *ALERT!* You\'ve been bugged!',
    '💬 *Hello?? Hello??*',
    '🎯 Tagged!',
    '👀 *I see you online...*',
    '📡 *Signal received. Awaiting reply...*',
    '🤙 *Pick up!*',
    '💥 *BOOM* — bugged again!',
    '🔊 *NOTIFICATION NOISE.mp3*',
    '🏓 Ping!',
    '📌 *You\'ve been pinned down!*',
    '⚡ *ZAP!*',
];

function buildJid(input) {
    const clean = input.replace(/[^0-9]/g, '');
    if (!clean) return null;
    return clean.includes('@') ? clean : `${clean}@s.whatsapp.net`;
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

module.exports = {
    command: new Command(
        'bug',
        'Repeatedly ping a contact to get their attention (owner only)',
        '.bug [@mention | number] [count 1-20] — or .bug stop',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🐛');

            const ownerJid = `${process.env.OWNER_NUMBER}@s.whatsapp.net`;

            // ── STOP command ──────────────────────────────────────
            if (args[0]?.toLowerCase() === 'stop') {
                const session = global.bugSessions.get(ownerJid);
                if (session?.active) {
                    session.active = false;
                    await react('🛑');
                    await reply('🛑 *Bug session stopped.*');
                } else {
                    await reply('ℹ️ No active bug session to stop.');
                }
                return;
            }

            // ── STATUS command ────────────────────────────────────
            if (args[0]?.toLowerCase() === 'status') {
                const session = global.bugSessions.get(ownerJid);
                if (session?.active) {
                    await reply(`🐛 *Bug running*\n\nTarget: \`${session.target}\`\nSent: ${session.sent}/${session.total}`);
                } else {
                    await reply('ℹ️ No active bug session.');
                }
                return;
            }

            // ── Resolve target ────────────────────────────────────
            let targetJid = null;

            // From @mention
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentioned && mentioned.length > 0) {
                targetJid = mentioned[0];
            }

            // From first arg (number or @number)
            if (!targetJid && args[0]) {
                const raw = args[0].replace('@', '');
                if (/^\d{7,}$/.test(raw)) {
                    targetJid = buildJid(raw);
                }
            }

            if (!targetJid) {
                await reply(
                    `🐛 *Bug Command*\n\n` +
                    `Usage:\n` +
                    `• \`.bug @mention [count]\` — bug someone by mention\n` +
                    `• \`.bug 2547XXXXXXXX [count]\` — bug by number\n` +
                    `• \`.bug stop\` — stop current session\n\n` +
                    `_Count: 1-20, default 10. Max delay: 1.2s between messages._\n` +
                    `_Owner is exempt from being bugged._`
                );
                return;
            }

            // ── Safety: don't bug the owner ───────────────────────
            if (targetJid === ownerJid || targetJid.split('@')[0] === process.env.OWNER_NUMBER) {
                await reply('⚠️ Cannot bug the owner.');
                return;
            }

            // ── Parse count ───────────────────────────────────────
            // Count can be last arg if it's a plain number
            const lastArg = args[args.length - 1];
            let count = 10;
            if (lastArg && /^\d+$/.test(lastArg)) {
                count = Math.min(20, Math.max(1, parseInt(lastArg)));
            }

            // ── Check no active session ───────────────────────────
            const existingSession = global.bugSessions.get(ownerJid);
            if (existingSession?.active) {
                await reply(
                    `⚠️ A bug session is already running.\n\n` +
                    `Target: \`${existingSession.target}\`\n` +
                    `Use \`.bug stop\` to end it first.`
                );
                return;
            }

            // ── Start session ─────────────────────────────────────
            const targetNumber = targetJid.split('@')[0];
            const session = { active: true, target: targetJid, sent: 0, total: count };
            global.bugSessions.set(ownerJid, session);

            await react('🚀');
            await reply(
                `🐛 *Bug session started!*\n\n` +
                `🎯 Target: @${targetNumber}\n` +
                `📨 Messages: ${count}\n\n` +
                `_Use \`.bug stop\` to stop early._`
            );

            // ── Send loop ─────────────────────────────────────────
            let sent = 0;
            let failed = 0;
            for (let i = 0; i < count; i++) {
                if (!global.bugSessions.get(ownerJid)?.active) break;

                const msgText = BUG_MESSAGES[i % BUG_MESSAGES.length];

                try {
                    await Blu3Bot.sendMessage(targetJid, {
                        text: msgText,
                        mentions: [targetJid]
                    });
                    sent++;
                    session.sent = sent;
                } catch {
                    failed++;
                }

                // Randomised delay 800ms–1400ms to avoid rate-limit
                const wait = 800 + Math.floor(Math.random() * 600);
                await delay(wait);
            }

            // ── Done ──────────────────────────────────────────────
            session.active = false;

            const stopped = sent < count;
            await react(stopped ? '🛑' : '✅');
            await reply(
                `${stopped ? '🛑 Bug stopped early' : '✅ Bug session complete!'}\n\n` +
                `🎯 Target: @${targetNumber}\n` +
                `📨 Sent: ${sent}/${count}\n` +
                `${failed > 0 ? `❌ Failed: ${failed}\n` : ''}` +
                `_${stopped ? 'Stopped by owner.' : 'Done bugging!'}_`
            );
        }
    ),
    ownerOnly: true,
    aliases: ['annoy', 'buzz', 'pester']
};
