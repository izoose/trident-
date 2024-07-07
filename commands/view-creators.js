const { mongoClient } = require('../initializations/mongoDb')
const { PermissionsBitField } = require('discord.js');

const cIDtoCNAME = require('../util/cIdToCName')
const embedTemplate = require('../data/embeds/creatorList')

module.exports = {
    name: 'view-creators',
    description: "Returns a list of the creators who are currently being scanned in this channel.",
    async execute(interaction, options) {
        await interaction.deferReply()

        let isDM = false
        let hasPerms = false

        if (!interaction.guildId) { isDM = true, hasPerms = true };

        let channelIdInput = interaction.channelId
        if (isDM) {
            channelIdInput = interaction.user.id
        }

        const scanningDataDB = mongoClient.db('scanningData')
        const channelsCollection = scanningDataDB.collection('channels')
        const guildCollection = scanningDataDB.collection('guilds')

        const channelRef = await channelsCollection.findOne({ channelID: `${channelIdInput}` })
        const guildExists = await guildCollection.findOne({ guildID: `${interaction.guildId}` })

        if(channelRef){
            let embed = JSON.parse(JSON.stringify(embedTemplate))
            const creatorList = channelRef.creatorList
            let totalPages = Math.floor(creatorList.length/20) + 1
            let pageNum = 1
            let bodyText = ""

            if(options[0]){pageNum = options[0].value}
            if(pageNum>totalPages){await interaction.editReply({content: `The requested page numebr is too high! (Maximum: ${totalPages})`}); return}

            for(let i = (-20 + (20*pageNum)); i < creatorList.length; i++){
                if(i > (20*pageNum)){break}
                let chosen 
                let groupData = await cIDtoCNAME(creatorList[i], "group", true)
                let userData = await getFollowers(creatorList[i])

                if(groupData.memberCount != "error" & groupData.memberCount > userData){
                    chosen = groupData.name
                }else{
                    chosen = await cIDtoCNAME(creatorList[i], "user")
                }
                bodyText = bodyText + `**ID: ${creatorList[i]}** - ${chosen}\n`
            }
            embed.description = bodyText
            embed.footer.text = `Page ${pageNum} of ${totalPages}`
            if(!isDM){
                embed.title = `Creator List - #${interaction.channel.name}`
            }else{
                embed.title = `Creator List - ${interaction.user.username}`
            }

            await interaction.editReply({embeds: [embed]}); return
        }else{
            await interaction.editReply({content: `This channel has no creators in it!`})
            return
        }
    }
}


async function getFollowers(userID) {
    let followerFetch = await fetch(`https://friends.roblox.com/v1/users/${userID}/followers/count`)
    if (followerFetch.status != 200) { return (0) }

    let json = await followerFetch.json()
    return (json.count)
}
