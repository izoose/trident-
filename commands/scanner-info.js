const { mongoClient } = require('../initializations/mongoDb')
const { PermissionsBitField } = require('discord.js');
const embedTemplate = require('../data/embeds/scannerInfo')
const assetTypes = require('../data/assetTypes')

module.exports = {
    name: 'scanner-info',
    description: "View details about the current scanning channel",
    async execute(interaction, options){ 
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

        const blacklistedTypes = channelRef.blacklistedAssetTypes
        let embed = JSON.parse(JSON.stringify(embedTemplate));
        if (!isDM){
            embed.title = `Scanner Information - <#${interaction.channel.id}>`
        }else{
            embed.title = `Scanner Information - ${interaction.user.tag}`
        }
        embed.description = `**Number of Creators:** ${channelRef.creatorList.length}`
        
        if (blacklistedTypes.length == 0){
            embed.fields[0].value = "None"
        }else{
            embed.fields[0].value = await blacklistedTypes.map((type) => assetTypes[type]).join(",\n")
        }
        interaction.editReply({embeds: [embed]})
    }
}