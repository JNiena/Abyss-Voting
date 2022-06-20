import { Filter, MongoClient, UpdateFilter } from "mongodb";

export class VoteDBUtils {
    private static url = 'mongodb://localhost:27017';
    private static dbName = 'voteBotDB';
    private static client = new MongoClient(this.url);


    public static async connect() {
        await this.client.connect();
    }

    public static async insertOne<T>(doc: Filter<T>) {
        const db = this.client.db(this.dbName);
        const polls = db.collection('pollsCollection');

        const insertResult = await polls.insertOne(doc);

        return insertResult;
    }

    public static async findOne<T>(filter: Filter<T>) {
        const db = this.client.db(this.dbName);
        const polls = db.collection('pollsCollection');

        const poll = await polls.findOne<T>(filter);

        return poll;
    }

    public static async findOneAndUpdate<T>(filter: Filter<T>, updateFilter: Filter<T>) {
        const db = this.client.db(this.dbName);
        const polls = db.collection('pollsCollection');

        const poll = await polls.findOneAndUpdate(filter, updateFilter);

        return poll;
    }

    public static async findOneAndReplace<T>(filter: Filter<T>, replacement: Filter<T>) {
        const db = this.client.db(this.dbName);
        const polls = db.collection('pollsCollection');

        const poll = await polls.findOneAndReplace(filter, replacement);

        return poll;
    }
}