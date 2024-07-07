const fetchAsseThumbnail = require('../util/fetchAssetThumbnail')
const embedTemplate = require('../data/embeds/cid')
const { mongoClient } = require('../initializations/mongoDb')

module.exports = {
    name: 'cid',
    description: "Returns the current Asset ID the bot is collecting data from. This is mostly for developers.",
    async execute(interaction, options){ 
        await interaction.deferReply()

        const assetDataFetch = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`)
        if(assetDataFetch.status == 200){
            const embed = JSON.parse(JSON.stringify(embedTemplate))
            const json = await assetDataFetch.json()
            const thumbnail = await fetchAsseThumbnail(json.AssetId)

            embed.fields[0].value = `[${json.Name}](https://www.roblox.com/library/${json.AssetId})`
            embed.fields[1].value = `${json.AssetId}`
            embed.fields[2].value = `<t:${Math.floor((new Date(json.Created).getTime())/1000)}:R>`
            embed.thumbnail.url = thumbnail

            await interaction.editReply({embeds: [embed]}); return 
        }else{
            await interaction.editReply({content: `Failed to retrieve asset info! Please try again later.`}); return  
        }
    }
}
