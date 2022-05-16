import { CommandInteraction, MessageEmbed } from "discord.js";

export class EmojiSelector {
    private static numericalEmojis = [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine"
    ];

    private static fallbackEmojis = [
        "green_apple",
        "apple",
        "pear",
        "tangerine",
        "lemon",
        "hamburger",
        "fries",
        "hotdog",
        "pizza",
        "spaghetti",
        "soccer",
        "baseball",
        "football",
        "baseball",
        "tennis",
        "telephone",
        "pager",
        "cd",
        "trackball",
        "joystick",
        "movie_camera",
        "watch",
        "mobile_phone_off",
        "alarm_clock"
    ];


    public static addEmojisToVote(interaction: CommandInteraction, voteEmbed: MessageEmbed, answers: string[], emojiMode: string | null) {
        if (emojiMode) {
            if (emojiMode == "Numbers") {
                voteEmbed = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.numericalEmojis);
            }
            else if (emojiMode == "Random Emojis") {
                voteEmbed = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.fallbackEmojis);
            }
            else if (emojiMode == "Custom Emojis") {
                voteEmbed = this.setCustomEmojisToVote(voteEmbed, answers);
            }
        }
        else {
            voteEmbed = this.setDefaultEmojisToVote(voteEmbed, answers, EmojiSelector.numericalEmojis);
        }
        
        return voteEmbed;
    }


    private static setDefaultEmojisToVote(voteEmbed: MessageEmbed, answers: string[], emojiNames: string[]) {
        let emojiDescription = "";
        const optionCount = answers.length;
        let emojiList = optionCount <= 9 ? EmojiSelector.numericalEmojis : EmojiSelector.fallbackEmojis;

        if (emojiNames[0] === EmojiSelector.fallbackEmojis[0]) {
            emojiList = EmojiSelector.fallbackEmojis;
        }
        
        for (let i = 0; i < optionCount; i++) {
            const chosenEmoji = `\:${emojiList[i]}:`

            emojiDescription += `${chosenEmoji}. ${answers[i]}\n`;
        }

        emojiDescription = emojiDescription.slice(0, -1);

        voteEmbed.setDescription(emojiDescription);

        return voteEmbed;
    }

    private static setCustomEmojisToVote(voteEmbed: MessageEmbed, answers: string[]) {
        return voteEmbed; //TODO
    }
}