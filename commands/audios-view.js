const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const {mongoClient} = require('../initializations/mongoDb')

const embedTemplate = require('../data/embeds/audios-view')

let cookie
(async() => {
    const initData = mongoClient.db('initData')
    const proxies = initData.collection('Proxies')
    const data = await proxies.findOne({title: "nonScanningCookie"})
    cookie = data.data.cookie
})();

module.exports = {
    name: 'audios-view',
    description: "Replies with audio files for the requested assets.",
    async execute(interaction, options){ 
        await interaction.deferReply()


        const assetCheckFetch = await fetch(`https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${options[0].value}`, {
            headers: {
                cookie: `.ROBLOSECURITY=${cookie}`
            }
        })
        try{
            const json = await assetCheckFetch.json()
            if(assetCheckFetch.status != 200){
                console.log(json)
                switch(json.code){
                    case 1:
                        await interaction.editReply(`Error: Too many assets.`)
                        break
                    case 2:
                        await interaction.editReply(`Error: Invalid asset list.`)
                        break
                }
                return
            }
            if(json.data.length == 0){await interaction.editReply(`None of the provided assets are audios!`); return}

            const audioAssets = []
            const jsonToSend = []
            await json.data.forEach(asset => {
                if(!asset.asset.typeId == 3){return}
                audioAssets.push({
                    id: asset.asset.id,
                    name: asset.asset.name,
                    creatorId: asset.creator.id,
                    creatorName: asset.creator.name
                })
            });
            if(audioAssets.length == 0){await interaction.editReply(`None of the provided assets are audios!`); return}

            await audioAssets.forEach(asset => {
                jsonToSend.push({
                "requestId": "0",
                "assetId": asset.id,
                })
            })
            
            const audioFetch = await fetch('https://assetdelivery.roblox.com/v2/assets/batch', {
                method: 'post',
                headers: {
                    "accept": "application/json, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    "roblox-browser-asset-request": "false",
                    "roblox-place-id": `${options[1].value}`,
                    "sec-ch-ua": "\"Microsoft Edge\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "cookie": `.ROBLOSECURITY=${cookie}`,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                  },
                  body: JSON.stringify(jsonToSend)
            })
            if(!audioFetch.status == 200){await interaction.editReply(`An error occoured while fetching audio data (${audioFetch.status})`); return}
            const audioJson = await audioFetch.json()
            let embed = JSON.parse(JSON.stringify(embedTemplate))
            let errors = 0
            let sucsess = 0
            await audioJson.forEach((result, i) => {
                if(result.errors){
                    errors++
                    let toPush = {
                        "name": "AudioNameHere",
                        "value": "Id: idHere\nCreator: nameHere\nAudio URL: https://www.roblox.com/library"
                    }
                    toPush.name = audioAssets[i].name
                    if(result.errors[0].code == 403){
                        toPush.value = `Asset ID: [${audioAssets[i].id}](https://www.roblox.com/library/${audioAssets[i].id})\nCreator: ${audioAssets[i].creatorName}\nError: Place ID is not Authorized to Access Asset`
                    }else{
                        toPush.value = `Asset ID: [${audioAssets[i].id}](https://www.roblox.com/library/${audioAssets[i].id})\nCreator: ${audioAssets[i].creatorName}\nError: ${result.errors[0].message}`
                    }
                    embed.embeds[0].fields.push(toPush)
                }else{
                    sucsess++
                    let toPush = {
                        "name": "AudioNameHere",
                        "value": "Id: idHere\nCreator: nameHere\nAudio URL: https://www.roblox.com/library"
                    }
                    toPush.name = audioAssets[i].name
                    toPush.value = `Asset ID: [${audioAssets[i].id}](https://www.roblox.com/library/${audioAssets[i].id})\nCreator: ${audioAssets[i].creatorName}\nAudio URL: ${result.locations[0].location}`
                    embed.embeds[0].fields.push(toPush)
                }
            })
            embed.content = `Successfully Fetched ${sucsess} Audio(s)!\nErrors: ${errors}`
            await interaction.editReply(embed)
        }catch(err){
            console.log(err)
            await interaction.editReply(`Error: An Unexpected Error Has Occoured (${assetCheckFetch.status})`)
        }
        return
    }
}
