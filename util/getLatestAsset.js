const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const {mongoClient} = require('../initializations/mongoDb')


async function getLatestAsset(){
    let gameid
    let cookie

    const initData = mongoClient.db('initData')
    const proxies = initData.collection('Proxies')
    const data = await proxies.findOne({title: "nonScanningCookie"})
    
    gameid = data.data.universeId
    cookie = data.data.cookie

    const filePath = './assets/images/smile.jpg';
    const form = new FormData();
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileStream = fs.createReadStream(filePath);
    form.append('smile.jpg', fileStream, { knownLength: fileSizeInBytes });

    const tokenFetch = await fetch("https://auth.roblox.com/v1/login", {
        method: "post",
        headers: {
            cookie: `.ROBLOSECURITY=${cookie}`
        }
    })
    const token = tokenFetch.headers.get('x-csrf-token')
    
    const pubThumb = await fetch(`https://publish.roblox.com/v1/games/${gameid}/thumbnail/image`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            cookie: `.ROBLOSECURITY=${cookie}`,
            'x-csrf-token': token
        },
        body: form
    })

    if(pubThumb.status == 200){
        const getLatestAssetFetch = await fetch(`https://games.roblox.com/v2/games/${gameid}/media`, {
            headers: {
                cookie: `.ROBLOSECURITY=${cookie}`
            }
        })
        const latestAsset = await getLatestAssetFetch.json()
        return(latestAsset.data[0].imageId)
    }else{
        console.log(`An error occoured when getting the latest asset: ${pubThumb.status}`)
        return 1818
    }
}

module.exports = getLatestAsset