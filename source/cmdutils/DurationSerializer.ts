import moment from "moment";

export default class DurationSerializer {

    private static UNITS_SYMBOLS = {
        seconds: ["s", "sec", "second", "seconds"],
        minutes: ["m", "mi", "min", "minute", "minutes"],
        hours: ["h", "hr", "hrs", "hour", "hours"],
        days: ["d", "day", "days"],
        weeks: ["w", "week", "weeks"],
        months: ["mo", "month", "months"],
        years: ["y", "year", "years"]
    }


    private static extractTokens(duration: string) {
        duration = duration.replace(" ", "");

        let units: string[] = [];
        let values: string[] = [];

        let prev = 0;
        let token = duration[prev];

        for (let i = 1; i < duration.length; i++) {
            if (DurationSerializer.isNumeric(duration[i]) != DurationSerializer.isNumeric(duration[prev])) {
                if (DurationSerializer.isNumeric(duration[i])) {
                    units.push(token);
                }
                else {
                    values.push(token);
                }

                token = "";
            }

            token += duration[i];            
            prev = i;
        }

        if (DurationSerializer.isNumeric(token)) {
            values.push(token);
        }
        else {
            units.push(token);
        }

        return {
            units: units,
            values: values
        };
    }

    public static getParsedDuration(duration: string) {
        const tokens = this.extractTokens(duration);

        let durationsObject: { [key: string]: number } = {
            seconds: 0,
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 0,
            months: 0,
            years: 0
        };

        while (tokens.units.length > 0 || tokens.values.length > 0) {
            const unit = tokens.units.shift();
            const value = tokens.values.shift();
    
            if (!unit || !value) {
                throw new Error("Must provide the same number of units and values. Bare numbers are not supported!");
            }
            else {
                const key = this.getKeyFromUnit(unit);
    
                durationsObject[key] += parseInt(value);
            }
        }

        return moment.duration(durationsObject);
    }

    private static getKeyFromUnit(unit: string) {
        for (const [key, symbols] of Object.entries(this.UNITS_SYMBOLS)) {
            for (const symbol of symbols) {
                if (unit === symbol) {
                    return key;
                }
            }
        }

        let errorMsg = `Invalid duration unit specified: \`${unit}\`\n\n__How to use durations__\nDurations are specified in pairs of months and units - for example, \`12d\` would be 12 days.\nCompound durations are supported - for example, \`2d 12h\` would be 2 days and 12 hours.\n\n__The following units are supported__\n`;

        for (const [key, symbols] of Object.entries(this.UNITS_SYMBOLS)) {
            let line = "";
            const captilizedKey = key[0].toUpperCase() + key.substring(1);
            let symbolArr = [];

            for (const symbol of symbols) {
                symbolArr.push(`\`${symbol}\``);
            }

            line = `**${captilizedKey}:** ` + symbolArr.join(", ") + "\n";  
            
            errorMsg += line;
        }

        throw new Error(errorMsg);
    }

    private static isNumeric(str: string){
        return /^\d+$/.test(str);
    }
}