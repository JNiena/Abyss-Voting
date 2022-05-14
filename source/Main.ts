import { LogLevel, SapphireClient } from '@sapphire/framework';
import {Config} from "./Config";

const config: Config = new Config("config.json");
const client: SapphireClient = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'], logger: {level: LogLevel.Debug}});

client.login(config.get()["token"]).then();