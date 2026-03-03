// image generation is not supported with ai studio keys at this moment. it requires a vertex key and is an api limitation.

const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { detectKeyType } = require('../utils');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// command module
async function generateImage(prompt) {
    try {
        const imageModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image-preview",
        });

        const result = await imageModel.generateContent(prompt, {
            generationConfig: { responseModalities: ["IMAGE"] },
        });

        const imageData = result.response?.candidates?.[0]?.content?.parts?.find(
            (part) => part.inlineData
        )?.inlineData;

        if (!imageData) {
            console.error("No image data returned:", result);
            return null;
        }

        return Buffer.from(imageData.data, "base64");
    } catch (error) {
        console.error("Image generation error:", error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate an image with Ineffa.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Describe the image you want Ineffa to create.')
                .setRequired(true)),
                
    async execute(interaction) {
        try {
                await interaction.deferReply();

                const rawPrompt = interaction.options.getString('prompt');
                const prompt = rawPrompt.replace(/\s+/g, ' ').trim().slice(0, 500);
                const imgBuffer = await generateImage(prompt);
                const keyType = detectKeyType(process.env.API_KEY);

                /*
                 * the function checks whether the provided api key is a standard ai studio key or a more powerful vertex ai service account key.
                 * image and video generation models are currently only available to vertex ai users.
                 * this check ensures that ineffa doesn't try to use a feature that the user's api key doesn't support, preventing unnecessary errors and providing a clear message to the user.
                 */
                
                if (keyType !== "service-account") {
                    await interaction.editReply(
                        "Ineffa is monitoring the developent of image generation features and will integrate it as soon as it becomes accessible."
                    );
                    return;
                }
                if (imgBuffer) {
                    await interaction.editReply({
                        content: `Ineffa’s rendering of: *${prompt}*`,
                        files: [{ attachment: imgBuffer, name: 'ineffa.png' }]
                    });
                } else {
                    await interaction.editReply("Apologies. Ineffa was unable to produce an image for this request.");
                }
            } catch (err) {
                console.error("Error with /image:", err);
                await interaction.editReply("Directive error: Image generation failed. Task aborted.");
            }
    },
};