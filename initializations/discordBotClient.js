const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
client = new Client({ intents: [GatewayIntentBits.Guilds] });

const { mongoClient } = require('./mongoDb');
const fs = require('fs')

const assetDiscordEmbed = require('../data/embeds/assetDiscord');
const creatorIdToCreatorName = require('../util/cIdToCName');

(async () => {
    const initData = mongoClient.db("initData")
    const discordBotData = initData.collection("discordBotClient")

    const token = await discordBotData.findOne({ title: "token" })

    await client.login(token.data)

    // Register Slash Commands
    const commandList = require('../data/slashCommands')
    const rest = new REST({ version: '10' }).setToken(token.data);
    client.slashCommands = new Collection()
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.slashCommands.set(command.name, command);
    }

    try {
        for (guild in commandList) {
            if (guild != "Global") {
                await rest.put(Routes.applicationGuildCommands(client.user.id, `${guild}`), { body: commandList[guild] })
                console.log(`Successfully reloaded application (/) commands for guildId ${guild}.`);
            } else {
                await rest.put(Routes.applicationCommands(client.user.id), { body: commandList[guild] });
                console.log(`Successfully reloaded application (/) commands for GLOBAL.`);
            }
        }
    } catch (err) {
        console.log(err)
    }

})();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.commandName;

    // pecial Commands
    if(command == 'fuck them nasty ahh hoes'){
        client.slashCommands.get(command).execute(interaction, interaction.options.data);
    } else {
        //every other command
        client.slashCommands.get(command).execute(interaction, interaction.options.data);
    }

    if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            return;
        }
        if (command.autocomplete) {
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }
});



// Exported Functions
async function sendAssetDiscord(assetData, DBOBJ, thumbnailUrl) {
    const embed = JSON.parse(JSON.stringify(assetDiscordEmbed));

    const creatorName = await creatorIdToCreatorName(assetData.creator.targetId, assetData.creator.typeId);
    embed.thumbnail.url = thumbnailUrl;

    let creatorUrlBase = assetData.creator.type === 'User' ? 'https://www.roblox.com/users/' : 'https://www.roblox.com/groups/';

    const date = new Date(assetData.created);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    const creationDiscordStringFull = `<t:${unixTimestamp}:F>`;

    embed.description = `**Name:** [${assetData.name}](https://www.roblox.com/library/${assetData.id})\n**Type:** ${assetData.type}\n**Description:** ${assetData.description}\n**Created:** ${creationDiscordStringFull}`;
    embed.fields[0].value = assetData.id;
    embed.fields[1].value = `${creatorName} ||[[${assetData.creator.targetId}]](${creatorUrlBase}${assetData.creator.targetId})||`;
    embed.fields[2].value = `[Click Here!](https://assetdelivery.roblox.com/v1/asset/?id=${assetData.id})`;

    for await (const channel of DBOBJ.channelList){
        const assetBlacklist = channelsList.find((chnl) => chnl.channelID == channel.channelID).blacklistedAssetTypes
        if (assetBlacklist.includes((assetData.typeId).toString())){
            continue
        }
        try {
            let channelRef;
            if (!channel.isDM) {
                channelRef = await client.channels.fetch(channel.channelID);
            } else {
                channelRef = await client.users.fetch(channel.channelID);
            }
            await channelRef.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = { sendAssetDiscord };
