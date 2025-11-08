const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Replies with Pong! and shows Ineffa's latency.`),

    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: "Calculating latency...", 
            fetchReply: true 
        });

        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`Ineffa's Latency Report`)
            .addFields(
                { name: 'Message Latency', value: `${ping}ms`, inline: true },
                { name: 'API Latency', value: `${apiPing}ms`, inline: true }
            )
            .setFooter({ text: "Operational check complete." })
            .setTimestamp();

            await interaction.editReply({ content: "Pong!", embeds: [embed] });
    },
};