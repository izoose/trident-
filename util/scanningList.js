const {mongoClient} = require('../initializations/mongoDb')

async function updateScanningList(){
    scanningList = []
    const scanningData = mongoClient.db('scanningData')
    const creators = scanningData.collection('creators')
    const creatorList = creators.find({})
   
    for await (const data of creatorList) {
        const objectToPush = {}
        objectToPush.creatorID = data.creatorId
        objectToPush.channelList = data.channelList

       scanningList.push(objectToPush)
    }
    return
}
async function updateChannelsList(){
    channelsList = []
    const scanningData = mongoClient.db('scanningData')
    const creators = scanningData.collection('channels')
    const creatorList = creators.find({})
   
    for await (const data of creatorList) {
        const objectToPush = {}
        objectToPush.isDM = data.isDM
        objectToPush.channelID = data.channelID
        objectToPush.blacklistedAssetTypes = data.blacklistedAssetTypes
        channelsList.push(objectToPush)
    }
    return
}

module.exports = {updateScanningList, updateChannelsList}
