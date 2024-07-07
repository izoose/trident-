module.exports = {
    "Global": [
        {
            "name": "add-creator",
            "description": "Adds a creator to scan in the current channel",
            "options": [
                {
                    "type": 4,
                    "name": "creator-id",
                    "description": "The ID of the user or group you want the bot to track.",
                    "required": true
                },
                {
                    "type": 3,
                    "name": "creator-type",
                    "description": "user or group",
                    "required": true,
                    "choices": [
                        {
                            "name": "User",
                            "value": "user"
                        },
                        {
                            "name": "Group",
                            "value": "group"
                        }
                    ]
                }
            ]
        },
        {
            "name": "remove-creator",
            "description": "removes a creator from scanning in the current channel",
            "options": [
                {
                    "type": 4,
                    "name": "creator-id",
                    "description": "The ID of the user or group you want to remove.",
                    "required": true
                }
            ]
        },
        {
            "name": "view-creators",
            "description": "Returns a list of the creators who are currently being scanned in this channel.",
            "options": [
                {
                    "type": 4,
                    "name": "page-number",
                    "description": "defaults to 0"
                }
            ]
        },
        {
            "name": "localizationtables-view",
            "description": "View the contents of a LocalizationTableTranslation asset in a .txt file",
            "options": [
                {
                    "type": 4,
                    "name": "asset-id",
                    "description": "The Asset ID of the LocalizationTableTranslation",
                    "required": true
                }
            ]
        },
        {
            "name": "audios-view",
            "description": "Replies with audio files for the requested assets.",
            "options": [
                {
                    "type": 3,
                    "name": "audio-asset-ids",
                    "description": "A list of the audio assets, separated with a \",\"",
                    "required": true
                },
                {
                    "type": 4,
                    "name": "place-id",
                    "description": "The suspected place id from where the audio's originate from.",
                    "required": true
                }
            ]
        },
        {
            "name": "cid",
            "description": "Returns the current Asset ID the bot is collecting data from. This is mostly for developers.",
            "options": []
        },
        {
            "name": "scanner-info",
            "description": "View details about the current scanning channel",
            "options": []
        },
        {
            "name": "toggle-asset-type",
            "description": "Toggle's an asset type from being scanned in the current scanning channel.",
            "options": [
                {
                    "type": 3,
                    "name": "asset-type",
                    "description": "the type of asset (eg: \"MeshPart\")",
                    "required": true
                }
            ]
        }
    ]
}
