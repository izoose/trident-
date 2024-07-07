const {mongoClient} = require('./initializations/mongoDb')
const discordBotClient = require('./initializations/discordBotClient')
const assetScanner = require('./initializations/assetScanner')

const {updateScanningList, updateChannelsList} = require('./util/scanningList.js')
const getLatestAsset = require('./util/getLatestAsset')

global.scanningList = [];
global.channelsList = [];


(async() => {
    const latestAsset = await getLatestAsset()
    await updateScanningList()
    await updateChannelsList()

    assetId = latestAsset
})();