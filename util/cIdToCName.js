const {mongoClient} = require('../initializations/mongoDb');

let nonScanningCookie = null;
(async() => {
    
    const initData = mongoClient.db("initData")
    const proxies = initData.collection('Proxies')
    const data = await proxies.findOne({title: "nonScanningCookie"})
    nonScanningCookie = data.data.cookie
})();

async function creatorIdToCreatorName(id, type, returnFullJSON){
    if(type == 1 || type.toString().toLowerCase() == "user"){
        const userFetch = await fetch(`https://users.roblox.com/v1/users/${id}`, {
            headers: {
                cookie: nonScanningCookie
            }
        })
        if(userFetch.status == 200){
            const json = await userFetch.json()
            if(!returnFullJSON){
                return(json.name)
            }else{
                return(json)
            }
            
        }else{
            return("error")
        }
    }else if(type == 2 || type.toString().toLowerCase() == "group"){  
        const groupFetch = await fetch(`https://groups.roblox.com/v1/groups/${id}`, {
            headers: {
                cookie: nonScanningCookie
            }
        })
        if(groupFetch.status == 200){
            const json = await groupFetch.json()
            if(!returnFullJSON){
                return(json.name)
            }else{
                return(json)
            }
        }else{
            return("error")
        }
    }
}

module.exports = creatorIdToCreatorName