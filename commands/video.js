// video generation is not supported with ai studio keys at this moment. it requires a vertex key and is an api limitation.

const { SlashCommandBuilder } = require('discord.js');
const { detectKeyType } = require('../utils');

// command module
async function generateVideo(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-preview:generateVideo?key=${process.env.API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                numberOfVideos: 1,
                resolution: "720p"
            })
        });

        const data = await response.json();

        if (!data.videos || !data.videos[0].videoUri) {
            console.error("Veo API response:", data);
            return null;
        }

        return data.videos[0].videoUri;
    } catch (err) {
        console.error("Video fetch error:", err);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('video')
        .setDescription('Generate a video with Ineffa using Veo 3.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe the video you want Ineffa to create.')
                .setRequired(true)),
    
    async execute (interaction) {
        try {
                await interaction.deferReply();
        
                const prompt = interaction.options.getString('prompt');
                const keyType = detectKeyType(process.env.API_KEY);

                if (keyType !== "service-account") {
                    await interaction.editReply(
                        "Ineffa is monitoring the developent of video generation features and will integrate it as soon as it becomes accessible."
                    );
                    return;
                }

                const videoUrl = await generateVideo(prompt);
        
                if (videoUrl) {
                    await interaction.editReply({
                        content: `Ineffa’s creation: *${prompt}*\n${videoUrl}`
                    });
                } else {
                    await interaction.editReply("Apologies. Ineffa could not generate a video for this request.");
                }
            } catch (err) {
                console.error("Error with /video:", err);
                await interaction.editReply("Directive error: Video generation failed. Task aborted.");
            }
    },
};