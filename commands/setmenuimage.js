// commands/setmenuimage.js - CONVERTED FOR BLU3BOT
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
const axios = require('axios');

module.exports = {
    command: new Command(
        'setmenuimage',
        'Set menu image using any image URL',
        '.setmenuimage [image_url]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🖼️');
            
            // Check if user is bot owner
            const isOwner = context.sender === '254745469050@s.whatsapp.net';
            if (!isOwner) {
                await reply('❌ This command is only available for bot owner!');
                return;
            }

            // Check if URL is provided
            if (!args || args.length === 0) {
                await reply(`🖼️ *Set Menu Image*\n\nUsage: ${context.prefix}setmenuimage <image_url>\n\nExample: ${context.prefix}setmenuimage https://i.ibb.co/abc123/image.jpg`);
                return;
            }

            let imageUrl = args[0];
            
            // Basic URL validation
            if (!imageUrl.startsWith('http')) {
                await reply('❌ Invalid URL! Must start with http:// or https://');
                return;
            }

            // Clean up URL
            try {
                const url = new URL(imageUrl);
                const blacklistedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'msclkid'];
                blacklistedParams.forEach(param => url.searchParams.delete(param));
                imageUrl = url.toString();
            } catch (e) {
                console.log("URL parsing failed, using original:", imageUrl);
            }

            try {
                await reply('🔄 Downloading image...');

                console.log(`🌐 Downloading image from: ${imageUrl}`);

                // Download image
                const response = await axios({
                    method: 'GET',
                    url: imageUrl,
                    responseType: 'arraybuffer',
                    timeout: 25000,
                    maxContentLength: 15 * 1024 * 1024,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                    },
                    decompress: true,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    }
                });

                // Verify it's an image
                const contentType = response.headers['content-type'];
                if (!contentType || !contentType.startsWith('image/')) {
                    const urlLower = imageUrl.toLowerCase();
                    const hasImageExtension = urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
                                             urlLower.includes('.png') || urlLower.includes('.webp') ||
                                             urlLower.includes('.gif');
                    if (!hasImageExtension) {
                        await reply('❌ Not a valid image URL');
                        return;
                    }
                }

                const imageBuffer = Buffer.from(response.data);
                const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

                // File size validation
                if (imageBuffer.length > 10 * 1024 * 1024) {
                    await reply(`❌ *Image too large!* (${fileSizeMB}MB > 10MB limit)`);
                    return;
                }

                if (imageBuffer.length < 2048) {
                    await reply('❌ Image too small or corrupted');
                    return;
                }

                console.log(`✅ Image downloaded: ${fileSizeMB}MB, type: ${contentType}`);

                // Define paths
                const mediaDir = path.join(__dirname, "..", "media");
                const menuImagePath = path.join(mediaDir, "blu3bot.jpg");
                const backupDir = path.join(mediaDir, "backups");
                
                // Create directories if they don't exist
                if (!fs.existsSync(mediaDir)) {
                    fs.mkdirSync(mediaDir, { recursive: true });
                }
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }

                // Create backup of existing image
                if (fs.existsSync(menuImagePath)) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    const backupPath = path.join(backupDir, `blu3bot-backup-${timestamp}.jpg`);
                    try {
                        fs.copyFileSync(menuImagePath, backupPath);
                        console.log(`💾 Backup created: ${backupPath}`);
                    } catch (backupError) {
                        console.log("⚠️ Could not create backup");
                    }
                }

                // Save the image
                try {
                    fs.writeFileSync(menuImagePath, imageBuffer);
                    console.log(`✅ Menu image saved: ${menuImagePath}`);
                } catch (writeError) {
                    await reply('❌ *Failed to save image*');
                    return;
                }

                // Verify the saved file
                const stats = fs.statSync(menuImagePath);
                if (stats.size === 0) {
                    throw new Error("Saved file is empty");
                }

                // Test if the image can be read back
                try {
                    const testRead = fs.readFileSync(menuImagePath);
                    if (testRead.length < 2048) {
                        throw new Error("File corruption during save");
                    }
                } catch (readError) {
                    await reply('❌ Image file corrupted');
                    return;
                }

                // Send success message with image preview
                await Blu3Bot.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: `✅ *Menu Image Updated!*\n\n📸 ${fileSizeMB}MB • ${contentType ? contentType.split('/')[1].toUpperCase() : 'Image'}\n🌐 ${new URL(imageUrl).hostname}\n\nUse ${context.prefix}menu to see it!`
                }, { quoted: message });

                console.log('✅ Menu image updated successfully');

            } catch (error) {
                console.error("❌ [SETMENUIMAGE] ERROR:", error);
                
                let errorMessage = "❌ Failed to set menu image";
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += "\n• Domain not found";
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += "\n• Download timeout";
                } else if (error.response?.status === 404) {
                    errorMessage += "\n• Image not found";
                } else if (error.response?.status === 403) {
                    errorMessage += "\n• Access denied";
                } else {
                    errorMessage += `\n• ${error.message}`;
                }
                
                await reply(errorMessage);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['setimage', 'changemenuimage']
};

// Helper function to determine file extension
function getFileExtension(contentType, url) {
    if (contentType) {
        if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
        if (contentType.includes('png')) return '.png';
        if (contentType.includes('webp')) return '.webp';
        if (contentType.includes('gif')) return '.gif';
    }
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.png')) return '.png';
    if (urlLower.includes('.webp')) return '.webp';
    if (urlLower.includes('.gif')) return '.gif';
    
    return '.jpg';
}