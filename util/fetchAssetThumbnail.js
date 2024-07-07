async function fetchAssetThumbnail(id){
    try{
    const f = await fetch('https://thumbnails.roblox.com/v1/batch', {
        method: 'post',
        body: JSON.stringify([
            {
              "requestId": "string",
              "targetId": `${id}`,
              "token": "string",
              "alias": "string",
              "type": "Asset",
              "size": "512x512",
              "format": "string",
              "isCircular": false
            }
          ])
    })
    const json = await f.json()
    return json.data[0].imageUrl
    }catch(err){
        return 'https://tr.rbxcdn.com/634786cd8a78625e44231ab2e5ec6c2d/512/512/Image/Png/isCircular'
    }
}

module.exports = fetchAssetThumbnail