import { LogLevel, SapphireClient } from '@sapphire/framework';
import Config from './Config';

const client = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'], logger: {level: LogLevel.Debug}});


client.login(Config.token);