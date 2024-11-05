<img alt="logo" src="./logo.png" />

<div align="center">
    <p>
        <a href="#setup">Getting started →</a>
    </p>
    <p>Self-hosted unlimited file storage using Discord.</p>
    <p>🔒 Secure&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;🎈 Easy to use&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;✔ Authorization</p>
</div>

## How it works?

A file you upload is splitted into less than 8mb pieces and each part is encrypted and uploaded to a Discord server via a bot. To keep the parts connected, every next file is a response to the previous one.\
When the app stops, all your unfinished files will start uploading again. 👈 

Downloading a file is done in reverse, by first downloading all necessary files from discord, decrypting merging them.

> [!NOTE]
> Discord-drive uses local [level](https://github.com/Level/level) database to store file data and message IDs.

## Setup

Getting started:

1. First clone this repo and make sure you have downloaded NodeJS with package manager of your choice.
2. Go to [Discord Applications](https://discord.com/developers/applications) and create __New Application__.
3. Go to OAuth2 and add redirect `http://localhost:3000/api/callback` (localhost or your own host) to redirects.
4. Create a server on Discord and invite your bot. 
5. Create `.env` file in the root of this project and copy everything from `.env.example`. Then fill in credentials from your app:

    ```env
    DISCORD_TOKEN=         # Bot token (Bot > Token)
    DISCORD_CLIENT_ID=     # Application ID (OAuth2 > Application ID)
    DISCORD_CLIENT_SECRET= # OAuth2 Secret (OAuth2 > Client Secret)
    DISCORD_GUILD_ID=      # Guild/Server ID
    ```

6. Add SECRET to the `.env` file. This will be used to hash files you send so that they are protected. <u>If you somehow lose this secret, you won't be able to encrypt your files.</u>
7. Open up the terminal and install dependencies:
    ```sh
    npm i
    # or using any other node package manager
    ```
8. Create builds:
    ```sh
    npm run build
    ```
9. Run the server:
    ```sh
    npm start
    ```
10. You're done! Go to [localhost:3000](localhost:3000).

## Tech

* [`sirv`](https://github.com/lukeed/sirv) - used for serving static files.
* [`find-my-way`](https://github.com/delvedor/find-my-way) - used for HTTP routing.
* [`ws`](https://github.com/websockets/ws) - used for live upload progress. 
* [`preact`](https://preactjs.com/) - used for client rendering.
* [`unocss`](https://unocss.dev/) and [`daisyui`](https://daisyui.com/) for styling.
* [`rollup`](https://rollupjs.org/) - used for bundling.

## License

MIT 💖