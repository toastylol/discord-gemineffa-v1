# ineffa - multifunctional discord bot  

[![Ineffa Introduction](https://i.postimg.cc/8CDJfCWV/b8c79e2838c9968b8ef285ee06459711-Original.jpg)](https://github.com/toastylol/discord-gemineffa-v1/blob/main/assets/Ineffa%20Intro.mp4)

ineffa is a versatile, ai-powered discord bot based on the character, ineffa from genshin impact; designed to assist with server moderation, provide information, and engage with users through conversation, it is built with node.js, discord.js, and powered by the google gemini api.
 
---  

## features  
  
* **conversational ai**: engage in natural conversation by mentioning (`@Ineffa`) the bot. it maintains conversation history for context.  
* **web search**: get summarized answers to questions about current events using the `/search` command, powered by gemini's built-in google search.  
* **file analysis**: analyze uploaded files (images, documents, etc.) by providing a task with the `/analyse` command.
* **automod management**:  
    * dynamically create automod rules for keyword filtering and mention spam with `/automod-create`.  
    * enable or disable all server automod rules at once with `/automod-toggle`.  
* **admin tools**: secure admin-only commands, such as 
    * `/setlimit` to change the conversation history length.
    * `/log` to dump the bot's logs into a log file in the root directory.  
* **dynamic presence**: the bot's status rotates through various activities.

---  
  
## setup and installation  
  
### prerequisites  
* [node.js](https://nodejs.org/) (v16.9.0 or higher) (v18.17.0 is recommended)
* a discord bot application with a token  
* api keys for google gemini  
  
### installation steps
  
1.  **clone the repository:**  
    ```bash  
    git clone https://github.com/toastylol/discord-gemineffa-v1.git
    cd discord-gemineffa-v1
    ```
  
2.  **install dependencies:**  
    ```bash  
    npm install discord.js @google/generative-ai dotenv
    ```  
  
3.  **configure environment variables:**  
    create a file named `.env` in the project's root directory and add the following variables:  
  
    ```env
    # your discord bot's token  
    TOKEN=YOUR_DISCORD_BOT_TOKEN  
  
    # your discord application's client id  
    CLIENT_ID=YOUR_DISCORD_CLIENT_ID  
  
    # your google gemini api key  
    API_KEY=YOUR_GEMINI_API_KEY  
  
    # the discord user id of the bot's administrator  
    ADMIN_USER_ID=YOUR_DISCORD_USER_ID  

    # the activity url for your bot activity (can only be a twitch link / youtube link)
    ACTIVITY_URL=YOUR_ACTIVITY_URL

    # what you want ineffa to call you as
    CREATOR_NAME=YOUR_NAME  
    ```  
4.  **create a log file:**
    create a file named `logs.txt` in the project's root directory.

5.  **register slash commands:**
    run the deployment script once to register all slash commands with discord.  
    ```bash
    node deploy-commands.js  
    ```  
  
6.  **run the bot:**  
    ```bash  
    node gemineffa.js  
    ```  
---  
  
## usage  
  
### conversational chat  
-   mention the bot `@Ineffa` at the beginning of your message to start a conversation.
-   you can also reply to any of the bot's messages to talk to it.
  
### slash commands  
-   `/analyse [file] [task]`: analyzes an uploaded file.  
-   `/automod-create [type] [options]`: creates a new automod rule.  
-   `/automod-toggle [status]`: enables or disables all automod rules.
-   `/devbadge`: an easy command to obtain the discord developer badge.
-   `/log [lines]`: dumps ineffa's logs into a file in your root directory.
-   `/image [prompt]`: generates images based on your prompt. 
> (requires vertex ai key or access api directly through rest or the sdk)
-   `/ping`: shows the bot's current ping.
-   `/search [query]`: searches the web for information.  
-   `/setlimit [limit]`: (admin only) sets the message history limit for conversations.
-   `/uptime`: shows how long the bot has been online.  
-   `/video [prompt]`: generates videos based on your prompt.
> (requires vertex ai key)