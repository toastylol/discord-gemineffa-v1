const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Searches the web and provides a summarized answer.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The question or topic you want to search for.')
                .setRequired(true)),
                
    async execute(interaction) {
        const flashModel = interaction.client.flashModel;
        try {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            const result = await flashModel.generateContent({
                contents: [{ role: "user", parts: [{ text: query }] }],
                tools: [{
                    googleSearch: {},
                }],
            });
            const response = result.response;
            const text = response.text();

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`Search results for ${query}`)
                .setDescription(text)
                .setFooter({ text: 'Answer provided by Ineffa with Google Search' })
                .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error with Gemini API search:', error);
                await interaction.editReply('Apologies. An error occurred while processing your search request. Ineffa will attempt recovery if you wish to retry.');
            }
        },
};
