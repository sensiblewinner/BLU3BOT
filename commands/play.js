// commands/play.js - CONVERTED FOR BLU3BOT
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const axios = require('axios');
const crypto = require('crypto');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
   },
   formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g);
         return Buffer.from(matches.join(''), 'hex');
      },
      decrypt: async (enc) => {
         try {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
         } catch (error) {
            throw new Error(error)
         }
      }
   },
   youtube: url => {
      if (!url) return null;
      const a = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ];
      for (let b of a) {
         if (b.test(url)) return url.match(b)[1];
      }
      return null
   },
   request: async (endpoint, data = {}, method = 'post') => {
      try {
         const { data: response } = await axios({
            method,
            url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
            data: method === 'post' ? data : undefined,
            params: method === 'get' ? data : undefined,
            headers: savetube.headers
         })
         return {
            status: true,
            code: 200,
            data: response
         }
      } catch (error) {
         throw new Error(error)
      }
   },
   getCDN: async () => {
      const response = await savetube.request(savetube.api.cdn, {}, 'get');
      if (!response.status) throw new Error(response)
      return {
         status: true,
         code: 200,
         data: response.data.cdn
      }
   },
   download: async (link, format) => {
      if (!link) {
         return {
            status: false,
            code: 400,
            error: "No link provided. Please provide a valid YouTube link."
         }
      }
      if (!format || !savetube.formats.includes(format)) {
         return {
            status: false,
            code: 400,
            error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
            available_fmt: savetube.formats
         }
      }
      const id = savetube.youtube(link);
      if (!id) throw new Error('Invalid YouTube link.');
      try {
         const cdnx = await savetube.getCDN();
         if (!cdnx.status) return cdnx;
         const cdn = cdnx.data;
         const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
            url: `https://www.youtube.com/watch?v=${id}`
         });
         if (!result.status) return result;
         const decrypted = await savetube.crypto.decrypt(result.data.data); 
         var dl;
         try {
            dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
               id: id,
               downloadType: format === 'mp3' ? 'audio' : 'video',
               quality: format === 'mp3' ? '128' : format,
               key: decrypted.key
            });
         } catch (error) {
            throw new Error('Failed to get download link. Please try again later.');
         };
         return {
            status: true,
            code: 200,
            result: {
               title: decrypted.title || "Unknown Title",
               type: format === 'mp3' ? 'audio' : 'video',
               format: format,
               thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
               download: dl.data.data.downloadUrl,
               id: id,
               key: decrypted.key,
               duration: decrypted.duration,
               quality: format === 'mp3' ? '128' : format,
               downloaded: dl.data.data.downloaded
            }
         }
      } catch (error) {
         throw new Error('An error occurred while processing your request. Please try again later.');
      }
   }
};

module.exports = {
    command: new Command(
        'play',
        'Download and send songs as MP3 documents',
        '.play [song name or youtube url]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            try {
                if (!args || args.length === 0) {
                    await react("🎵");
                    return reply(`🎵 *Play Music*\n\n${context.prefix}play <song name>\n\nExample: ${context.prefix}play Home by NF`);
                }

                const searchQuery = args.join(" ");
                console.log(`🎵 Searching for: ${searchQuery}`);

                await react("🔍");
                await reply(`🔍 *Searching*: "${searchQuery}"`);

                // Determine if input is YouTube link or search query
                let videoUrl = '';
                if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
                    videoUrl = searchQuery;
                } else {
                    // Search YouTube for the video
                    const { videos } = await yts(searchQuery);
                    if (!videos || videos.length === 0) {
                        await react("❌");
                        await reply(`❌ No songs found for "${searchQuery}"`);
                        return;
                    }
                    videoUrl = videos[0].url;
                    console.log(`🎵 Found: ${videos[0].title} - ${videoUrl}`);
                }

                await react("⬇️");
                await reply(`🔍 *Searching*: "${searchQuery}" ✅\n⬇ *Downloading MP3...*`);

                // Download using savetube
                let result;
                try {
                    result = await savetube.download(videoUrl, 'mp3');
                } catch (err) {
                    console.error("❌ [PLAY] Savetube error:", err);
                    await react("❌");
                    await reply(`❌ Download service failed: ${err.message}`);
                    return;
                }

                if (!result || !result.status || !result.result || !result.result.download) {
                    await react("❌");
                    await reply(`❌ Failed to get download link`);
                    return;
                }

                await react("📤");
                await reply(`🔍 *Searching*: "${searchQuery}" ✅\n⬇ *Downloading MP3...* ✅\n📤 *Sending MP3 Document...*`);

                // Download the MP3 file
                const tempDir = path.join(__dirname, "../temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                
                const tempFile = path.join(tempDir, `${Date.now()}.mp3`);
                
                try {
                    const response = await axios({
                        url: result.result.download,
                        method: 'GET',
                        responseType: 'stream',
                        timeout: 45000
                    });

                    if (response.status !== 200) {
                        throw new Error('Failed to download MP3 file');
                    }

                    const writer = fs.createWriteStream(tempFile);
                    response.data.pipe(writer);
                    
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    // Read the file into buffer
                    const audioBuffer = fs.readFileSync(tempFile);
                    const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

                    // Clean filename
                    const cleanTitle = result.result.title
                        .replace(/[^\w\s-]/gi, '')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .substring(0, 40);

                    const fileName = `${cleanTitle}.mp3`;

                    // Send as MP3 DOCUMENT
                    await Blu3Bot.sendMessage(from, {
                        document: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: fileName,
                        caption: `🎵 *${result.result.title}*\n👤 ${result.result.duration || 'Unknown duration'}\n📊 ${fileSizeMB}MB`
                    }, { quoted: message });

                    await react("✅");
                    await reply(`✅ *MP3 Document Sent!*\n\n"${result.result.title}"\n📁 You can save this file`);

                    console.log(`✅ Successfully sent MP3 document: ${result.result.title}`);

                } catch (downloadError) {
                    console.error("❌ [PLAY] Download error:", downloadError);
                    await react("❌");
                    await reply(`❌ Failed to download MP3 file: ${downloadError.message}`);
                } finally {
                    // Clean up temp file
                    setTimeout(() => {
                        try {
                            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                        } catch (cleanError) {
                            console.log("Cleanup error:", cleanError);
                        }
                    }, 5000);
                }

            } catch (error) {
                console.error("❌ [PLAY] ERROR:", error);
                await react("❌");
                await reply(`❌ Error: ${error.message}`);
            }
        }
    ),
    aliases: ['song', 'music', 'mp3']
};