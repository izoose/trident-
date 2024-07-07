const { mongoClient } = require('../initializations/mongoDb')
const { PermissionsBitField } = require('discord.js');
const assetTypes = require('../data/assetTypes')
const { updateChannelsList } = require('../util/scanningList.js')

const db = mongoClient.db('initData');
const discordBotClient = db.collection('discordBotClient');

module.exports = {
    name: 'toggle-asset-type',
    description: "Toggle's an asses type from being scanned in the current scanning channel.",
    async execute(interaction, options){ 
        const assetType = (options[0].value).toLocaleLowerCase();
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

        if (!channelRef) { await interaction.editReply({ content: `This channel has no scanner!` }); return }

        let member = null
        let guild = null
        if (!isDM) {
            guild = await client.guilds.fetch(interaction.guildId)
            member = await guild.members.fetch(interaction.user.id)
        }

        if (isDM || guildExists.managePermissions.users.includes(interaction.user.id) || member.roles.cache.some(role => guildExists.managePermissions.roles.includes(role.id)) || member.permissions.has([PermissionsBitField.Flags.Administrator])) {
            hasPerms = true
        }
        if (!hasPerms) { await interaction.editReply({ content: `You don't have permissions to run this command!` }); return }
        const assetTypesArray = (Object.values(assetTypes)).map(at => at.toLocaleLowerCase())
        if (assetTypesArray.includes(assetType)){
            let assetTypeId = -1
            for ([key, value] of Object.entries(assetTypes)){
                if (value.toLocaleLowerCase() == assetType){
                    assetTypeId = key
                    break
                }
            }
            if (assetTypeId != -1){
                if (channelRef.blacklistedAssetTypes.includes(assetTypeId)) { // remove asset type from blacklistedAssetTypes
                    await channelsCollection.updateOne(
                        { channelID: `${channelIdInput}` },
                        {$pull: {
                            "blacklistedAssetTypes": assetTypeId
                        }}
                    )
                    interaction.editReply(`Assets with type: ${assetTypes[assetTypeId]} will now show up in this scanner.`)

                }else{ // add asset type to blacklistedAssetTypes
                    await channelsCollection.updateOne(
                        { channelID: `${channelIdInput}` },
                        {$push: {
                            "blacklistedAssetTypes": assetTypeId
                        }}
                    )
                    interaction.editReply(`Blacklisted all assets with type: ${assetTypes[assetTypeId]} from being scanned in this scanner.`)
                }
                await updateChannelsList()
            }
        }else{
            interaction.editReply("Not a valid asset type.")
        }
    }
}