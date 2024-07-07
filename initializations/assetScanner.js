const fetch = require('node-fetch')
const {mongoClient} = require('./mongoDb');
var HttpsProxyAgent = require('https-proxy-agent');
const timersPromises = require('timers/promises');

const {sendAssetDiscord} = require('./discordBotClient')
const fetchThumbnail = require('../util/fetchAssetThumbnail')

global.assetId = 1818
let proxies = null;
let cookies = null;
let rateLimit = null;
let endpoint = null;

let prevScannedAssets = []

async function readyInit(){
    // Fetch Scanning data from Database
    try{
        const initData = mongoClient.db("initData")
        const Proxies = initData.collection("Proxies")
        const scanning = initData.collection("scanning")
        const proxyList = await Proxies.findOne({title: "proxyList"}); proxies = proxyList.data
        const cookieList = await Proxies.findOne({title: "cookieList"}); cookies = cookieList.data
        const rateLimitFetch = await scanning.findOne({title: "rateLimit"}); rateLimit = rateLimitFetch.value
        const endpointFetch = await scanning.findOne({title: "endpoint"}); endpoint = endpointFetch.value
        return
    }catch(err){
        throw err
    }
};

async function scanAssets(proxy, cookie, endpoint, assetId){
    let assetString
    const idArray = Array.from({length: 50}, (_, i) => i + assetId); assetString = idArray.join(",")
    try{
        const assetDataFetch = await fetch(`${endpoint}${assetString}`, {
            agent: proxy,
            headers: {
                cookie: `.ROBLOSECURITY=${cookie}`
            }
        })
        const assetJson = await assetDataFetch.json()
        handleJSON(assetJson)
    }catch(err){
        console.log(err)
        return
    }
}

async function handleJSON(json){
    try{
        if(json.data.length == 0){
            //console.log(json.data.length, assetId)
            assetId = assetId - 200
        }
        await json.data.forEach(async (asset) => {
            if(scanningList.some(obj => obj.creatorID === `${asset.creator.targetId}`)){
                if(prevScannedAssets.includes(asset.id)){return}
                const scanningChannel = scanningList.find(obj => obj.creatorID === `${asset.creator.targetId}`)
                const thumbnail = await fetchThumbnail(asset.id)
                sendAssetDiscord(asset, scanningChannel, thumbnail)
                prevScannedAssets.push(asset.id)
            }
        })
    }catch (err){
        console.log(err)
    }

}

(async() => {
    await readyInit()
    await timersPromises.setTimeout(5000)
    for(let proxy in proxies){
        proxies[proxy] = new HttpsProxyAgent(`http://${proxies[proxy]}`)
    }

    console.log('\x1b[32m%s\x1b[0m', "STARTING SCANNING PROCESS...")
    console.log('\x1b[34m%s\x1b[0m', `AssetID: ${assetId}`)
    console.log('\x1b[34m%s\x1b[0m', `Proxies: ${proxies.length}`)
    console.log('\x1b[34m%s\x1b[0m', `Cookies: ${cookies.length}`)
    console.log('\x1b[34m%s\x1b[0m', `Rate Limit: ${rateLimit}`)

    setInterval(() => {
        for(let p in proxies){
            scanAssets(proxies[p], cookies[p], endpoint, assetId)
            assetId = assetId + 50
        }
    }, 60000/rateLimit);

    setInterval(() => {
        prevScannedAssets = []
    }, 30000);
})()
