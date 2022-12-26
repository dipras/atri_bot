import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import logger from './services/logger_service.js';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { db } from './config/database.js';

// Import Events and Commands
import mention from './events/mention.js';

// Intialized env
dotenv.config();

// Get Token
const token = process.env.BOT_TOKEN;

try {
    // Create Discord.js Client Instance
    const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions] });
    
    // Import All Events
    const eventsPath = path.join(path.resolve(), 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
    
    // Import All Commands
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }

    // Login to Discord with your token
    client.login(token);
}
catch (ex) {
    console.log(ex);
    logger.error(ex);
}

