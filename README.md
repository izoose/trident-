# Trident
- Documentation for setup is below. (Made by ChatGPT, hopefully it's doable.) 
- Video will come soon within the following week.

### 1. Create a MongoDB Database

1. **Sign Up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. **Create a Cluster**: Follow the prompts to create a new cluster.
3. **Database Access**: Create a database user with the necessary permissions.
4. **Network Access**: Whitelist your IP address to allow connections.
5. **Get Connection String**: From the cluster dashboard, click "Connect", then "Connect your application". Copy the connection string (MongoDB URI).

### 2. Configure the Bot

1. **Clone the Repository**:
   - Go to the repository link: https://github.com/izoose/trident-/tree/main
   - Download the repository as a ZIP file and extract it to your desired location.

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Configure MongoDB**:
   Go to the `config.js` file in the `trident/data` directory with the following content:
   ```js
   module.exports = {
       dbURL: "MONGO_DB_URL_HERE",
   }
   ```

### 3. Set Up Proxies

1. **Buy Proxies**: Purchase 3 ISP USA proxies from [proxy-seller.com](https://proxy-seller.com/).
2. **Add Proxies to MongoDB**:
   - **Create a Collection**: In your MongoDB Atlas UI, navigate to your cluster, click on your database, and click "Add My Own Data". Name the collection `Proxies`.
   - **Insert Proxy Details**: Click on the `Proxies` collection, then click "Insert Document". Add the following document:
     ```json
     {
         "title": "proxyList",
         "data": [
             "proxy1",
             "proxy2",
             "proxy3"
         ]
     }
     ```

### 4. Generate Roblox Cookies

1. **Generate Cookies**: Open an incognito window and log in to 5 different Roblox accounts to get the cookies.
2. **Get Universe ID**: From one of the alts, get the universe ID of their default place.

### 5. Create MongoDB Documents

1. **Match Database Structure**:
   - Create collections and documents in MongoDB to match the provided structure.

### Database Structure

- **initData**
  - **Proxies**
  - **discordBotClient**
  - **scanning**

- **scanningData**
  - **channels**
  - **creators**

### How to Create and Insert Documents in MongoDB

1. **Create a Collection**:
   - In the MongoDB Atlas UI, navigate to your database and click "Add My Own Data".
   - Name the collection as needed (e.g., `Proxies`, `discordBotClient`, `scanning`, `channels`, `creators`).

2. **Insert Documents**:
   - Click on the collection name.
   - Click "Insert Document".
   - Add the document details. For example, for `initData.Proxies`:
     ```json
     {
         "title": "proxyList",
         "data": [
             "proxy1",
             "proxy2",
             "proxy3"
         ]
     }
     ```

   For `discordBotClient`:
    ```js
     {
         "title": "token",
         "data": "your_discord_bot_token"
     }
    ```

   Repeat the process for other collections and documents as per your bot’s requirements.

### Final Steps

1. **Run the Bot**:
   ```sh
   node index.js
   ```

2. **Maintain Proxies and Hosting**:
   Regularly update proxies and ensure your hosting provider is reliable.
