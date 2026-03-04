/*
 * this script is responsible for registering and updating the slash commands for ineffa.
 * it reads all the command files from the '/commands' directory and sends their data to discord's api. this process is necessary whenever you add a new command or modify the definition (name, description, options, etc.) of an existing one.
 * 
 * ineffa then, dynamically loads all command files from the 'commands' directory.
 * this is the same logic used in gemineffa.js to load commands for execution, but here ineffa is just extracting the command data to be sent to the api instead of executing them.
 */

require ('dotenv/config');

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

/*
 * ineffa creates a new instance of the rest class, which is used to make requests to the discord api.
 * it's configured with version 10 and the ineffa's token for auth.
 * 
 * this is an immediately invoked async function that handles deployment of commands.
 */

(async() => {
    try {
        console.log(`Started refreshing ${commands.length} application commands.`);
        
        /*
         * the rest.put() method sends a put request to application commands route, which effectively overwrites all existing slash commands for this client id with the new set of commands.
         * "node deploy-commands.js" is how you register new commands and update existing ones.
         * the body of the request contains the json representation of all our commands.
         */
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        
        console.log(`Successfully reloaded ${data.length} application commands`);
    } catch (error) {
        console.error(error);
    }
})();