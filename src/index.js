"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const framework_1 = require("@sapphire/framework");
const Config_1 = __importDefault(require("./Config"));
const client = new framework_1.SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'], logger: { level: 20 /* Debug */ } });
client.login(Config_1.default.token);
