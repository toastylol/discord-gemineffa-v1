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
        
        /*
         * ineffa calculates two different latency values here:
         * 
         * 1. message latency: this is the time it takes for a message to be sent from discord,
         *    received by ineffa, and for a reply to be sent back. it's a good measure of the
         *    round-trip time for a command.
         * 
         * 2. api latency: this is the websocket heartbeat ping. it measures the connection
         *    speed between ineffa and discord's servers, which is a good indicator of
         *    the bot's general responsiveness.
         */
        
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