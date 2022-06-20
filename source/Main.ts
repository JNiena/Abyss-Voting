import {LogLevel, SapphireClient} from "@sapphire/framework";
import { VoteDBUtils } from "./cmdutils/VoteDBUtils";
import {Config} from "./Config";

const config: Config = new Config("../config.json");
const client: SapphireClient = new SapphireClient({intents: ["GUILDS", "GUILD_MESSAGES"], logger: {level: LogLevel.Debug}});

client.login(config.get()["token"]).then();

VoteDBUtils.connect();