const fs = require('fs');
const timestampsFilePath = './command_timestamps.json';

/*
 * this function splits a long message into smaller chunks that fit within discord's character limit.
 * it's line-aware, so it tries not to break in the middle of a line, which helps with formatting.
 */

function splitMessage(text, maxLength = 2000) {
    if (text.length <= maxLength) return [text];

    const messageParts = [];
    let currentPart = '';
    const lines = text.split('\n');

    for (let line of lines) {
        while (line.length > maxLength) {
            const chunk = line.substring(0, maxLength);
            messageParts.push(chunk);
            line = line.substring(maxLength);
        }

        if (currentPart.length + line.length + 1 > maxLength) {
            messageParts.push(currentPart);
            currentPart = '';
        }
        currentPart += (currentPart.length > 0 ? '\n' : '') + line;
    }

    if (currentPart.length > 0) messageParts.push(currentPart);
    return messageParts;
}

/*
 * these functions handle the reading and writing of a json file that stores timestamps.
 * used by the devbadge command to remember when a user last ran it, it's a simple way to persist small amounts of data without needing a full database.
 */

function readTimestamps() {
    try {
        if (fs.existsSync(timestampsFilePath)) {
            const data = fs.readFileSync(timestampsFilePath, 'utf8');
            if (data) {
            return JSON.parse(data);
            }
        }
    } catch (error) {
        console.error("Error reading timestamps file:", error);
    }
    return {};
}

function writeTimestamps(data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(timestampsFilePath, jsonString);
    } catch (error) {
        console.error("Error writing to the timestamp file:", error);
    }
}

/*
 * this util function checks the format of an api key to determine its type.
 *
 * - "missing": key is not provided.
 * - "ai-studio": key is a standard ai studio key.
 * - "service-account": key is a vertex ai service key, which has more capabilities.
 * 
 * this is used to conditionally enable features like image and video generation.
 */

function detectKeyType(apiKey) {
    if (!apiKey) return "missing";

    if (apiKey.startsWith("AIza")) {
        return "ai-studio";
    }

    if (apiKey.includes("BEGIN PRIVATE KEY")) {
        return "service-account";
    }
}

/*
 * this function determines the general type of a file based on its mime type or file extension.
 * it is used by analyse command to decide how to display the file in the response (e.g., showing an image directly or providing a link to a document).
 */

function getFileType(file) {
    if (!file) return "unknown";

    const mime = file.contentType?.toLowerCase() || "";
    const name = file.name?.toLowerCase() || "";

    if (mime.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return "image";
    if (mime.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(name)) return "video";
    if (mime.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg)$/i.test(name)) return "audio";
    if (mime.startsWith("application/pdf") || /\.(pdf|txt|docx?|csv|json|xml)$/i.test(name)) return "document";

    return "unknown";
}

/*
 * this function takes a duration in milliseconds and formats it into a readable string.
 * for example, it would convert 123456789 ms into "1d10h17m36s".
 * it's used by the uptime command to display the ineffa's uptime in a clean way.
*/


function formatDuration(ms) {
  	let totalSeconds = Math.floor(ms / 1000);

  	const days = Math.floor(totalSeconds / 86400);
  	totalSeconds %= 86400;
  	const hours = Math.floor(totalSeconds / 3600);
  	totalSeconds %= 3600;
  	const min = Math.floor(totalSeconds / 60);
  	const seconds = totalSeconds % 60;

  	const parts = [];
        if (days > 0) parts.push(`${days}d`);
  	    if (hours > 0) parts.push(`${hours}h`);
  	    if (min > 0) parts.push(`${min}m`);
  	    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  	return parts.join("");
}

/*
 * this function handles the graceful shutdown of ineffa.
 * it clears the activity rotation interval, logs a shutdown message, disconnects ineffa from discord, and then exits the process.
 * this is called when ineffa receives a sigint (usually a ctrl + c terminate) or sigterm (usually a process exit through process managers) signal.
 */

function shutdown(client, activityInterval) {
    if (activityInterval) clearInterval(activityInterval);
    console.log("Shutting ineffa down...");
    
    const forceExit = setTimeout(() => {
        console.log("Graceful shutdown failed, forcing exit.");
        process.exit(1);
    }, 5000);

    client.destroy();
    clearTimeout(forceExit);
    process.exit(0);
}

module.exports = {
    splitMessage,
    readTimestamps,
    writeTimestamps,
    detectKeyType,
    getFileType,
    formatDuration,
    shutdown
};