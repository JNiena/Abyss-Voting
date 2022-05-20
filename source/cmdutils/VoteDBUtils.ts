import { MongoClient } from "mongodb";

export class VoteDBUtils {
    private static url = 'mongodb://localhost:27017';
    private static dbName = 'voteBotDB';
    private static client = new MongoClient(this.url);


    public static async insertOne(doc: any) {
        await this.client.connect();

        const db = this.client.db(this.dbName);
        const collection = db.collection('votesCollection');

        const insertResult = await collection.insertOne(doc);

        await this.client.close();

        return insertResult;
    }

    public static async find(doc: any) {
        await this.client.connect();

        const db = this.client.db(this.dbName);
        const collection = db.collection('votesCollection');

        const findCursor = await collection.find(doc);

        await this.client.close();

        return findCursor;
    }
}