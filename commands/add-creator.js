const { mongoClient } = require('../initializations/mongoDb')
const { PermissionsBitField } = require('discord.js');

const cIDtoCNAME = require('../util/cIdToCName')
const { updateScanningList } = require('../util/scanningList.js')

const { bypassUserIds } = require("../data/config.js")

const scanningDataDB = mongoClient.db('scanningData')
const channelsCollection = scanningDataDB.collection('channels')
const guildCollection = scanningDataDB.collection('guilds')
const creatorsCollection = scanningDataDB.collection('creators')

module.exports = {
    name: 'add-creator',
    description: "Adds a creator to scan in the current channel",
    async execute(interaction, options) {
        await interaction.deferReply();

        const creatorId = options[0].value;
        const type = options[1].value;

        if (!bypassUserIds.includes(interaction.user.id)) {
            const blacklistCollection = await scanningDataDB.collection('blacklists').findOne({name: 'blacklist'});
            const isBlacklisted = (blacklistCollection.blacklist).some((user) => user.creatorId == creatorId)

            if (isBlacklisted) {
                await interaction.editReply({ content: `This creator is blacklisted and cannot be added.`, ephemeral: true });
                return;
            }
        }

        const legitCreator = await cIDtoCNAME(`${options[0].value}`, `${options[1].value}`)
        if (legitCreator == 'error') { await interaction.editReply({ content: `The creator data you have provided is not valid!` }); return }

        let isDM = false
        let hasPerms = false

        if (!interaction.guildId) { isDM = true, hasPerms = true };

        let guildExists = false
        let channelExists
        let creatorExists = await creatorsCollection.findOne({ creatorId: `${options[0].value}` })

        guildExists = await guildCollection.findOne({ guildID: `${interaction.guildId}` })
        if (!isDM) {
            channelExists = await channelsCollection.findOne({ channelID: `${interaction.channelId}` })
        } else {
            channelExists = await channelsCollection.findOne({ channelID: `${interaction.user.id}` })
        }

        let member = null
        let guild = null
        if (!isDM) {
            guild = await client.guilds.fetch(interaction.guildId)
            member = await guild.members.fetch(interaction.user.id)
        }

        if (!isDM && channelExists == null) {
            if (guildExists == null) { // If no Guild
                if (!member.permissions.has([PermissionsBitField.Flags.Administrator])) {
                    await interaction.editReply({ content: "You need Administrator Perms to set up a scanning channel here!" }); return
                } else {
                    let newGuildDoc = {
                        guildID: `${interaction.guildId}`,
                        managePermissions: {
                            users: [],
                            roles: []
                        }
                    }
                    let newChannelDoc = {
                        channelID: `${interaction.channelId}`,
                        isDM: isDM,
                        creatorList: [
                            `${options[0].value}`
                        ],
                        blacklistedAssetTypes: []
                    }

                    if (creatorExists == null) {
                        let newCreatorDoc = {
                            creatorId: `${options[0].value}`,
                            channelList: [{
                                channelID: `${interaction.channelId}`,
                                isDM: isDM
                            }]
                        }
                        await creatorsCollection.insertOne(newCreatorDoc)
                    } else {
                        await creatorsCollection.updateOne(
                            { creatorId: `${options[0].value}` },
                            { $push: { channelList: { channelID: `${interaction.channelId}`, isDM: isDM } } },
                        )
                    }
                    await guildCollection.insertOne(newGuildDoc)
                    await channelsCollection.insertOne(newChannelDoc)

                    await updateScanningList()
                    await interaction.editReply({ content: `Added Creator: ${legitCreator} to scan in <#${interaction.channelId}>!` }); return
                }
            } else { // If guild but no Channel
                if (guildExists.managePermissions.users.includes(interaction.user.id) || member.roles.cache.some(role => guildExists.managePermissions.roles.includes(role.id)) || member.permissions.has([PermissionsBitField.Flags.Administrator])) {
                    hasPerms = true
                }
                if (!hasPerms) { await interaction.editReply({ content: `You don't have permissions to run this command!` }); return }
                let newChannelDoc = {
                    channelID: `${interaction.channelId}`,
                    isDM: isDM,
                    creatorList: [
                        `${options[0].value}`
                    ],
                    blacklistedAssetTypes: []
                }

                if (creatorExists == null) {
                    let newCreatorDoc = {
                        creatorId: `${options[0].value}`,
                        channelList: [{
                            channelID: `${interaction.channelId}`,
                            isDM: isDM
                        }]
                    }
                    await creatorsCollection.insertOne(newCreatorDoc)
                } else {
                    await creatorsCollection.updateOne(
                        { creatorId: `${options[0].value}` },
                        { $push: { channelList: { channelID: `${interaction.channelId}`, isDM: isDM } } },
                    )
                }
                await channelsCollection.insertOne(newChannelDoc)

                await updateScanningList()
                await interaction.editReply({ content: `Added Creator: ${legitCreator} to scan in <#${interaction.channelId}>!` }); return
            }
        } else { // If Channel or isDM
            if (isDM || guildExists.managePermissions.users.includes(interaction.user.id) || member.roles.cache.some(role => guildExists.managePermissions.roles.includes(role.id)) || member.permissions.has([PermissionsBitField.Flags.Administrator])) {
                hasPerms = true
            }
            if (!hasPerms) { await interaction.editReply({ content: `You don't have permissions to run this command!` }); return }
            let channelIdInput = interaction.channelId
            if (isDM) {
                channelIdInput = interaction.user.id
            }

            if (channelExists && channelExists.creatorList.includes(`${options[0].value}`)) { await interaction.editReply({ content: `This creator is already scanning in this channel!` }); return }
            if (creatorExists == null) {
                let newCreatorDoc = {
                    creatorId: `${options[0].value}`,
                    channelList: [{
                        channelID: `${channelIdInput}`,
                        isDM: isDM
                    }]
                }
                await creatorsCollection.insertOne(newCreatorDoc)
            } else {
                await creatorsCollection.updateOne(
                    { creatorId: `${options[0].value}`, "channelList.channelID": { $ne: channelIdInput } },
                    {
                        $push: {
                            channelList: {
                                channelID: `${channelIdInput}`,
                                isDM: isDM
                            }
                        }
                    },
                );
            }
            if (!channelExists) {
                let newChannelDoc = {
                    channelID: `${channelIdInput}`,
                    isDM: isDM,
                    creatorList: [
                        `${options[0].value}`
                    ],
                    blacklistedAssetTypes: []
                }
                await channelsCollection.insertOne(newChannelDoc)
            } else {
                await channelsCollection.updateOne(
                    { channelID: `${channelExists.channelID}` },
                    { $push: { creatorList: `${options[0].value}` } },
                )
            }
            await updateScanningList()
            if (!isDM) {
                await interaction.editReply({ content: `Added Creator: ${legitCreator} to scan in <#${interaction.channelId}>!` }); return
            } else {
                await interaction.editReply({ content: `Added Creator: ${legitCreator} to scan in this DM!` }); return
            }

        }
        return
    }
}
