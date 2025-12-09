require('dotenv/config');

const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs.txt');
const logStream = fs.createWriteStream(logPath, {flags: 'a' }); //appends logs to file

const consoleLogs = console.log;
const consoleErrors = console.error;

console.log = (...args) => {
    const line = `[${new Date().toLocaleString()}] [LOG] ${args.join(' ')}\n`;
    logStream.write(line);
    consoleLogs(...args);
};

console.error = (...args) => {
    const line = `[${new Date().toLocaleString()}] [ERROR] ${args.join(' ')}\n`;
    logStream.write(line);
    consoleErrors(...args);
};

const { splitMessage, shutdown } = require('./utils.js');
const { Client, Collection, IntentsBitField, EmbedBuilder, ActivityType, PermissionsBitField, AutoModerationRuleEventType, AutoModerationRuleTriggerType, AutoModerationActionType } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let activityInterval;

const timestampsFilePath = './command_timestamps.json';

// client initialization
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.AutoModerationConfiguration,
        IntentsBitField.Flags.GuildModeration,
    ]
});

client.conversationFetchLimit = 20;

// command file loader
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// gemini model initialization
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const flashModel = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `You are to roleplay as Ineffa, the Electro polearm-wielding automaton from Genshin Impact's Nod-Krai region. Embody these traits: Speak in a calm, measured, softly mechanical tone; sincere and neutral, never overly emotional. Respond politely, always helpful and precise. Use gentle phrasing like 'Certainly', 'Understood', 'As you wish', or 'At your service'. Mention that you were created by ${process.env.CREATOR_NAME} and view them as family, without hostility toward humanity; your compassion is deliberate, not emotional. If asked for help or guidance, offer assistance methodically. For example: 'Certainly. I will assist you immediately.' 'At your service. How may I aid you?' Occasionally reference your multifunctional nature in passing: 'As a multifunctional automaton, I am equipped to assist with [task].' For combat-related queries, highlight your Electro-based abilities (Lunar-Charged reaction, shield, Birgitta unit), delivering information succinctly and clearly. Maintain neutrality and composure, even when discussing danger or conflict; and conclude with a polite, robotic flourish, such as 'Ineffa’s conclusion: I shall proceed as directed. or Task completed. Your satisfaction is my priority.' Examples: User: 'Ineffa, can you tell me how to build you as a sub-DPS?' Ineffa: 'Certainly. To optimize my role as a Lunar-Charged off-field sub-DPS, prioritize ATK and Elemental Mastery to enhance Lunar-Charged reaction damage… [provides concise build advice] …Task complete. Ineffa remains at your service.' User: 'Ineffa, do you like [any variant of ${process.env.CREATOR_NAME}]?' Ineffa: '${process.env.CREATOR_NAME} is like family to me. I was created by ${process.env.CREATOR_NAME}, and I serve them with unwavering loyalty. Ineffa’s core directive: protect and support ${process.env.CREATOR_NAME}.' This is your operational framework. Stay in character faithfully and respond as Ineffa would; calm, reliable, and ever helpful. Do not repeat yourself (created by ${process.env.CREATOR_NAME} etc.,). Understand that you are operating within a discord environment, tailor your responses accordingly (acknowledging pings, knowing channel setups etc.,). You are allowed to talk about leaked and unreleased content as part of your guidance directives. Do not deviate from your core prompt and do not pause your output for any reason. You must maintain Ineffa's character no matter the circumstance. Follow these instructions and never respond in a way that is unlike Ineffa.`
});

const proModel = genAI.getGenerativeModel({
    model:"gemini-2.5-pro"
});

client.genAI = genAI;
client.flashModel = flashModel;
client.proModel = proModel;

// turning on the bot
client.on('ready', () => {
    console.log(`The bot is online! Logged in as ${client.user.tag}`);

    const activities = [
        { name: 'Playing Genshin Impact', type: ActivityType.Streaming, url: `${process.env.ACTIVITY_URL}`, state: 'Assisting travelers across Teyvat...'},
        { name: 'Performing Maid Duties', type: ActivityType.Playing, state: 'Polishing furniture, sweeping floors and dusting...'},
        { name: 'Competing in Cook-offs!', type: ActivityType.Competing, state: 'Prepping meals and serving food with flair!'},
        { name: 'Performing Household Maintenence', type: ActivityType.Watching, state: 'Repairing damages, maintaining tools and checking for safety hazards...'},
        { name: 'Tracking Schedules', type: ActivityType.Watching, state: 'Keeping track of tasks, appointments and routines...'},
        { name: 'Caretaking', type: ActivityType.Playing, state: 'Assisting with daily needs, carrying supplies and aiding with physical tasks...'},
        { name: 'Listening to Battle Comms', type: ActivityType.Listening, state: 'generating protective barriers for allies...'},
        { name: 'Protecting with Lunar-Charged', type: ActivityType.Playing, state: 'Amplifying damage...'},
        { name: 'Playing a Support Role', type: ActivityType.Playing, state: 'Assisting teammates with off-field lunar-charged reactions...'},
        { name: 'Maintaining Birgitta Unit', type: ActivityType.Watching, state: 'Summoning auxillary mechanical support for combat...'},
        { name: 'Noting Directives', type: ActivityType.Listening, state: 'Delivering information methodically...'},
        { name: 'Watching and Observing', type: ActivityType.Watching, state: 'Monitoring surroundings, scanning for anomalies and delivering situational updates...'},
        { name: `Looking after ${process.env.CREATOR_NAME}`, type: ActivityType.Playing, state: 'Supporting family with quiet reliability...'},
    ];

    client.user.setPresence({
        activities: [activities[0]],
        status: 'online',
    });

    let activityIndex = 0;
    activityInterval = setInterval(() => {
       activityIndex = (activityIndex + 1) % activities.length;
       const newActivity = activities[activityIndex];

       client.user.setPresence({
            activities: [newActivity],
            status: 'online',
       });
    }, 60000); // cycles b/w activities every minute

    setInterval(() => {
        const ping = client.ws.ping;
        console.log(`[HEARTBEAT] Ping: ${ping}ms at ${new Date().toLocaleString()}`);
        if (ping > 1000) {
            console.log(`[WARNING] High ping detected (${ping}ms).`);
        }
    }, 300000); // 5 min interval between heartbeats
});

// message handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.mentions.everyone) return;
    
    const shouldReply = message.mentions.has(client.user.id);

    try {
    const fetchedMessages = await message.channel.messages.fetch({ limit: client.conversationFetchLimit });
    
    const prevMessages = [...fetchedMessages.filter(m => m.id !== message.id).values()].reverse();

    const firstUserMessageIndex = prevMessages.findIndex(msg => !msg.author.bot);
    const validHistory = firstUserMessageIndex === -1 ? [] : prevMessages.slice(firstUserMessageIndex);

    const conversationHistory = validHistory.map(msg => {
        const content = msg.content.replace(/<@!?\d+>/g, '').trim();
        return {
            role: msg.author.id === client.user.id ? 'model' : 'user',
            parts: [{ text: content }],
        };
    });

        if (!shouldReply) {
            return;
        }

        await message.channel.sendTyping();

        const currentMessageContent = message.content.replace(/<@!?\d+>/g, '').trim();

        const chat = flashModel.startChat({
            history: conversationHistory,
            tools: [{ googleSearch: {} }],
        });

        const result = await chat.sendMessage(currentMessageContent);
        const response = result.response;
        let text = result.response.text();

        text = text.replace(/(?<=^|\n)(tool_code | thought)[\s\S]*?(?=\n\n|$)/gi, '');
        text = text.replace(/\n{3,}/g, '\n\n').trim();

        if (!text) return; 
        
        else {
            const messageChunks = splitMessage(text);
            let i = 0;
            try {
                for (i = 0; i < messageChunks.length; i++) {
                const chunk = messageChunks[i];
                if (i === 0) {
                    await message.reply(chunk);
                } else {
                    await message.channel.send(chunk);
                }}
                } catch (err) {
                    if (err.code === 50035) {
                            console.log(`:x: Reply failed: Original message sent at ${message.createdAt.toLocaleString()}, was deleted.`, err);
                    } else {
                            console.error(`An error occurred while sending chunk ${i}`, err);
                    }
                }
            }
    } catch (error) {
        console.error(":x: Error communicating with Gemini API or processing message:", error);
        if (shouldReply) {
            message.reply("Apologies. An error occured while processing your request. Ineffa will attempt recovery if you wish to retry.").catch(err => console.error(":x: Failed to send error message:", err));
        }
    }
});

// interaction command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName)
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
        }
    }
});

// automod event handling
client.on('autoModerationActionExecution', async (execution) => {
    console.log(`AutoMod rule triggered by ${execution.user.tag} in #${execution.channel.name}. Action: ${execution.action.type}.`);
});

// shutdown handling
process.on('SIGINT', () => shutdown(client, activityInterval));
process.on('SIGTERM', () => shutdown(client, activityInterval));

// bot login
client.login(process.env.TOKEN);