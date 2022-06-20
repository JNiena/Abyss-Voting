import { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";
import { GuildEmoji, MessageActionRow, MessageActionRowComponent, MessageActionRowComponentResolvable, MessageButton, MessageEmbed } from "discord.js";
import { container } from "@sapphire/framework";

export default class EmojiSelector {
    private static numericalEmojis = [
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "9️⃣"
    ];

    private static fallbackEmojis = [
        "🍏",
        "🍎",
        "🍐",
        "🍊",
        "🍋",
        "🍔",
        "🍟",
        "🌭",
        "🍕",
        "🍝",
        "⚽",
        "⚾",
        "🏈",
        "🎾",
        "☎️",
        "📟",
        "💿",
        "🖲️",
        "🕹️",
        "🎥",
        "⌚",
        "📴",
        "⏰"
    ];

    private static removeVoteEmoji = "🗑️";

    public static addEmojisToVote(voteEmbed: MessageEmbed, answers: string[], emojiMode: string | null, pollID: string) {        
        let components: MessageActionRow<MessageActionRowComponent, MessageActionRowComponentResolvable, APIActionRowComponent<APIMessageActionRowComponent>>[] = [];
        
        if (answers.length <= 1) {
			throw new Error("You need more than 1 option!");
		}
		else if (answers.length > EmojiSelector.fallbackEmojis.length) {
			throw new Error("You have too many options!");
		}

        if (!emojiMode) ({voteEmbed, components} = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.numericalEmojis, pollID));

        if (emojiMode == "Numbers") {
            ({voteEmbed, components} = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.numericalEmojis, pollID));
        }
        else if (emojiMode == "Random Emojis") {
            ({voteEmbed, components} = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.fallbackEmojis, pollID));
        }
        else if (emojiMode == "Custom Emojis") {
            ({voteEmbed, components} = this.setCustomEmojisToVote(voteEmbed, answers, pollID));
        }
        
        return {voteEmbed, components};
    }


    private static setDefaultEmojisToVote(voteEmbed: MessageEmbed, answers: string[], emojiNames: string[], pollID: string) {
        const optionCount = answers.length;
        let emojiList = optionCount <= 9 ? EmojiSelector.numericalEmojis : EmojiSelector.fallbackEmojis;

        if (emojiNames[0] === EmojiSelector.fallbackEmojis[0]) {
            emojiList = EmojiSelector.fallbackEmojis;
        }
        
        return this.setEmojisFromListToVote(voteEmbed, emojiList, answers, pollID);
    }

    private static setCustomEmojisToVote(voteEmbed: MessageEmbed, answers: string[], pollID: string) {
        const { client } = container;

        const optionCount = answers.length;
        const customEmojisList = client.emojis.cache;
        const numCustomEmojis = customEmojisList.size;

        if (numCustomEmojis >= optionCount) {
            const emojiList = customEmojisList.random(numCustomEmojis);

            return this.setEmojisFromListToVote(voteEmbed, emojiList, answers, pollID);
        }
        else {
            const numFillerEmojis = optionCount - numCustomEmojis;

            let emojiList: (string | GuildEmoji)[] = customEmojisList.random(numCustomEmojis);
            emojiList.concat(this.fallbackEmojis.slice(0, numFillerEmojis));

            return this.setEmojisFromListToVote(voteEmbed, emojiList, answers, pollID);
        }
    }

    private static setEmojisFromListToVote<T extends (string | GuildEmoji)[]>(voteEmbed: MessageEmbed, emojiList: T, answers: string[], pollID: string) {
        let optionCount = answers.length;
        let emojiDescription = "";
        
        const components: MessageActionRow[] = [];
        let currRow = new MessageActionRow();

        for (let i = 0; i < optionCount; i++) {
            const currentEmoji = emojiList[i];

            emojiDescription += `${currentEmoji}. ${answers[i]}\n`;

            if (i % 5 == 0 && i > 0) {
                components.push(currRow);
                currRow = new MessageActionRow();
            }

            currRow.addComponents(
                new MessageButton()
                .setCustomId(`voteButton-${pollID}-${i}`)
                .setEmoji(currentEmoji)
                .setStyle("PRIMARY")
            );

        }

        if (currRow.components.length >= 5) {
            components.push(currRow);

            currRow = new MessageActionRow();
        }

        currRow.addComponents(
            new MessageButton()
            .setCustomId(`voteButton-${pollID}-removeVote`)
            .setEmoji(EmojiSelector.removeVoteEmoji)
            .setStyle("DANGER")
        );

        components.push(currRow);

        emojiDescription = emojiDescription.slice(0, -1);
        voteEmbed.setDescription(emojiDescription);

        return {voteEmbed, components};
    }
}