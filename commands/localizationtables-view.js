const fs = require('fs');
const path = require('path');
const { mongoClient } = require('../initializations/mongoDb')

module.exports = {
    name: 'localizationtables-view',
    description: "View the contents of a LocalizationTableTranslation asset in a .txt file",
    async execute(interaction, options){ 
        await interaction.deferReply()

        const locTableID = options[0].value

        const assetFetch = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${locTableID}`)
        try{
            const json = await assetFetch.json()
            if(json.errors){await interaction.editReply(`Error: ${json.errors[0].message}`); return}
            if(!json.translationMapping){await interaction.editReply('Please make sure the specified Asset ID is a **LocalizationTableTranslation.**'); return}
            if(json.translationMapping.length == 0){await interaction.editReply('This LocalizationTableTranslation has no data.'); return}

            const sources = json.translationMapping.map(item => item.source);
            const filePath = path.join(__dirname, '..', 'assets', 'commandAssets', `LocalizationTable-data-${locTableID}-${new Date().getMilliseconds()}.txt`);
            fs.writeFileSync(filePath, sources.join('\n'));

            await interaction.editReply({
                files: [filePath],
                content: `Found ${json.translationMapping.length} strings!`,
              })
            fs.unlinkSync(filePath)
        }catch(err){
            console.log(err)
            await interaction.editReply('Please make sure the specified Asset ID is a **LocalizationTableTranslation**.')
        }
        return
    }
}
