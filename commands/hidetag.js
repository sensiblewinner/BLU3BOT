// commands/hidetag.js
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
        'hidetag',
        'Mentions all members in the group using a message or media',
        '.hidetag [message] or reply to media',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👥');
            
            const metadata = await Blu3Bot.groupMetadata(from);
            const tagList = metadata.participants.map(p => p.id);
            const quoted = message.message?.extendedTextMessage?.contextInfo;

            let outMsg;

            if (quoted?.quotedMessage) {
                const quotedMsg = quoted.quotedMessage;
                const type = Object.keys(quotedMsg)[0];

                switch (type) {
                    case 'imageMessage': {
                        const buffer = await Blu3Bot.downloadMediaMessage({
                            key: {
                                remoteJid: from,
                                fromMe: false,
                                id: quoted.stanzaId,
                                participant: quoted.participant
                            },
                            message: quotedMsg
                        });
                        outMsg = {
                            image: buffer,
                            caption: quotedMsg.imageMessage.caption || '',
                            mentions: tagList
                        };
                        break;
                    }

                    case 'videoMessage': {
                        const buffer = await Blu3Bot.downloadMediaMessage({
                            key: {
                                remoteJid: from,
                                fromMe: false,
                                id: quoted.stanzaId,
                                participant: quoted.participant
                            },
                            message: quotedMsg
                        });
                        outMsg = {
                            video: buffer,
                            caption: quotedMsg.videoMessage.caption || '',
                            mentions: tagList
                        };
                        break;
                    }

                    case 'audioMessage': {
                        const buffer = await Blu3Bot.downloadMediaMessage({
                            key: {
                                remoteJid: from,
                                fromMe: false,
                                id: quoted.stanzaId,
                                participant: quoted.participant
                            },
                            message: quotedMsg
                        });
                        outMsg = {
                            audio: buffer,
                            mimetype: 'audio/mp4',
                            ptt: true,
                            mentions: tagList
                        };
                        break;
                    }

                    case 'conversation':
                    case 'extendedTextMessage': {
                        const text = quotedMsg?.conversation || quotedMsg.extendedTextMessage?.text || '👥';
                        outMsg = { text, mentions: tagList };
                        break;
                    }

                    default: {
                        outMsg = { text: '👥', mentions: tagList };
                    }
                }
            } else {
                if (!args || !args.length) {
                    await reply("❗ Please provide a message or reply to one to mention everyone.");
                    return;
                }
                outMsg = {
                    text: args.join(' '),
                    mentions: tagList
                };
            }

            await reply(outMsg);
        }
    ),
    aliases: ['tag'],
    groupOnly: true
};