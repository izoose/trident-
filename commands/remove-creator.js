const {mongoClient} = require('../initializations/mongoDb')
const { PermissionsBitField } = require('discord.js');
const {updateScanningList} = require('../util/scanningList.js')

module.exports = {
    name: 'remove-creator',
    description: "removes a creator from scanning in the current channel",
    async execute(interaction, options){ 
        await interaction.deferReply()

        const db = mongoClient.db('initData');
        const discordBotClient = db.collection('discordBotClient');
        const blacklistedUsersRecord = await discordBotClient.findOne({ title: "blacklistedUsers" });
        if (blacklistedUsersRecord && blacklistedUsersRecord.data.includes(interaction.user.id)) {
            return interaction.reply({ content: "You are blacklisted from using this bot.", ephemeral: true });
        }

        let isDM = false
        let hasPerms = false

        if(!interaction.guildId){isDM = true, hasPerms = true};

        let channelIdInput = interaction.channelId
        if(isDM){
            channelIdInput = interaction.user.id
        }

        const scanningDataDB = mongoClient.db('scanningData')
        const channelsCollection = scanningDataDB.collection('channels')
        const guildCollection = scanningDataDB.collection('guilds')
        const creatorsCollection = scanningDataDB.collection('creators')

        const channelRef = await channelsCollection.findOne({channelID: `${channelIdInput}`})
        const guildExists = await guildCollection.findOne({guildID: `${interaction.guildId}`})

        if(!channelRef){await interaction.editReply({content: `This channel has no scanner!`}); return}

        let member = null
        let guild = null
        if(!isDM){
         guild = await client.guilds.fetch(interaction.guildId)
         member = await guild.members.fetch(interaction.user.id)
        }

        if(isDM || guildExists.managePermissions.users.includes(interaction.user.id) || member.roles.cache.some(role => guildExists.managePermissions.roles.includes(role.id)) || member.permissions.has([PermissionsBitField.Flags.Administrator])){
            hasPerms = true
        }
        if(!hasPerms){await interaction.editReply({content: `You don't have permissions to run this command!`}); return}

        if(channelRef){
          const creatorId = `${options[0].value}`
          if(channelRef.creatorList.includes(creatorId)){
            await channelsCollection.updateOne(
                {channelID: `${channelIdInput}`},
                { $pull: { creatorList: creatorId} },
            )
            await creatorsCollection.updateOne(
                {creatorId: creatorId},
                { $pull: { channelList: { channelID: `${channelIdInput}`} } },
            )
            await updateScanningList()
            await interaction.editReply({content: `Successfully removed creator!`})
          }else{
            await interaction.editReply({content: `The specified creator is not scanning in this channel!`})
            return
          }
        }else{
            await interaction.editReply({content: `This channel has no creators in it!`})
            return
        }
    }
}
