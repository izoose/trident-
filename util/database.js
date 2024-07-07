const { mongoClient } = require('../initializations/mongoDb');

const database = {
    async viewCreators(channelIdInput) {
        const scanningDataDB = mongoClient.db('scanningData');
        const channelsCollection = scanningDataDB.collection('channels');

        const channelRef = await channelsCollection.findOne({ channelID: channelIdInput });
        return channelRef ? channelRef.creatorList : [];
    },

    async addCreator(channelIdInput, creatorId, isDM) {
        const scanningDataDB = mongoClient.db('scanningData');
        const channelsCollection = scanningDataDB.collection('channels');
        const creatorsCollection = scanningDataDB.collection('creators');
    
        let channelExists = await channelsCollection.findOne({ channelID: channelIdInput });
        let creatorExists = await creatorsCollection.findOne({ creatorId: creatorId });
    
        if (!creatorExists) {
            await creatorsCollection.insertOne({
                creatorId: creatorId,
                channelList: [{ channelID: channelIdInput, isDM }]
            });
        } else {
            await creatorsCollection.updateOne(
                { creatorId: creatorId },
                { $push: { channelList: { channelID: channelIdInput, isDM } } }
            );
        }
    
        if (!channelExists) {
            await channelsCollection.insertOne({
                channelID: channelIdInput,
                isDM,
                creatorList: [creatorId]
            });
        } else {
            await channelsCollection.updateOne(
                { channelID: channelIdInput },
                { $push: { creatorList: creatorId } }
            );
        }
    },    
    async removeCreator(channelIdInput, creatorId) {
        const scanningDataDB = mongoClient.db('scanningData');
        const channelsCollection = scanningDataDB.collection('channels');
        const creatorsCollection = scanningDataDB.collection('creators');

        await channelsCollection.updateOne(
            { channelID: channelIdInput },
            { $pull: { creatorList: creatorId } }
        );

        await creatorsCollection.updateOne(
            { creatorId: creatorId },
            { $pull: { channelList: { channelID: channelIdInput } } }
        );
    }
};

module.exports = database;
