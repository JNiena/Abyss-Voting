"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoteCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
class CreateVoteCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'create-vote', description: 'Creates a new vote' }));
    }
    registerApplicationCommands(registry) {
        const builder = new builders_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription('Creates a new vote')
            .addStringOption(option => option.setName('title')
            .setDescription('the title of the vote')
            .setRequired(true))
            .addStringOption(option => option.setName('answers')
            .setDescription('a pipe (|) seperated list of available options')
            .setRequired(true))
            .addChannelOption(option => option.setName('channel')
            .addChannelType(0 /* GuildText */)
            .setDescription('the channel to send the poll in')
            .setRequired(false))
            .addStringOption(option => option.setName('emoji-mode')
            .setDescription('the category of emojis used in the poll')
            .addChoice('Numbers', 'Numbers')
            .addChoice('Random Emojis', 'Random Emojis')
            .setRequired(false))
            .addBooleanOption(option => option.setName('show-chart')
            .setDescription('whether to show a chart after the poll finished or not')
            .setRequired(false))
            .addStringOption(option => option.setName('duration')
            .setDescription('amount of time after which this poll should expire')
            .setRequired(false))
            .addNumberOption(option => option.setName('max-changes')
            .setDescription('the number of times a user is allowed to change their vote')
            .setRequired(false))
            .addNumberOption(option => option.setName('max-votes')
            .setDescription('the number of times a user is allowed to vote'));
        registry.registerChatInputCommand(builder, { behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */, idHints: ['974010187889389659'] });
    }
    chatInputRun(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.reply({ content: 'Vote created successfully!', ephemeral: true });
            const voteEmbed = new discord_js_1.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('someTitle')
                .setDescription('some description')
                .addFields({ name: 'Regular field title', value: 'Some value here' }, { name: 'Total Votes', value: '69', inline: true })
                .setTimestamp()
                .setFooter({ text: 'Some footer text here' });
            return (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send({ embeds: [voteEmbed] });
        });
    }
}
exports.CreateVoteCommand = CreateVoteCommand;
