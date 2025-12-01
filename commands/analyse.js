const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getFileType } = require("../utils");

// file fetcher and encoder
async function fetchAndEncodeFile(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

// command module 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('analyse')
        .setDescription('Analyses a provided file based on your task.')
        .addAttachmentOption(option => 
            option.setName('file')
                .setDescription('The file you want Ineffa to analyse.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('task')
                .setDescription('The analysis task.')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const file = interaction.options.getAttachment('file');
            const task = interaction.options.getString('task');

            const base64Data = await fetchAndEncodeFile(file.url);

            const proModel = interaction.client.proModel;
            const result = await proModel.generateContent([
                task,
                {
                    inlineData: {
                        mimeType: file.contentType || "application/octet-stream",
                        data: base64Data
                    },
                }
            ]);

            const responseText = result.response.text();

            const chunks = [];
            let remaining = responseText;
            while (remaining.length > 0) {
                chunks.push(remaining.substring(0, 4096));
                remaining = remaining.substring(4096);
            }
            
            // embedded response
            const embeds = chunks.map((chunk, index) => {
                const embed = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription(chunk)
                    
                if (index === 0) {
                    embed.setTitle(`Analysis of ${file.name}`)
                         .setFooter({ text: "Analysis powered by Ineffa using Gemini." })
                         .setTimestamp()
                         
                    if (getFileType(file) === "image") {
                        embed.setImage(file.url);
                    } else if (getFileType(file) === "video")  {
                            interaction.followUp({
                            content: `**Uploaded Video:** ${file.name}`, 
                            files: [{ attachment: file.url, name: file.name }],
                        });
                    } else {
                         embed.addFields({
                            name: 'Original File',
                            value: `[${file.name}](${file.url})`
                         });
                    }
                }
                return embed;
            });
            
           await interaction.editReply({ embeds: embeds.slice(0, 10) });

        } catch (error) {
            console.error("File analysis error:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("File Analysis Error")
                .setDescription("Ineffa could not analyse the file. The file type may not be supported (supported types are PDF, TXT, DOCX, PNG, JPEG, WebP, WAV, MP3, FLAC, MP4 and MOV) or an internal error occured.")
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
}