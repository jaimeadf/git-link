# GitLink
A simple and easy-to-use tool to download or create download links to single files or directories of GitHub repositories. You can try it on [git-link.vercel.app](https://git-link.vercel.app).

## How to use it:

To create a download link, you must build a URL following this pattern with your GitHub resource specified and customized with optional parameters. Then, open the URL, and wait for the download automatically start.

```http
GET /api/download?url=https://github.com/jaimeadf/git-link&zip=true&filename=git-link.zip
```

| Query Parameter | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | **Required**. The URL to your GitHub resource |
| `filename` | `string` | A custom filename for the downloaded file |
| `zip` | `boolean` | A flag to specify if single files should be zipped or not |


## How to run locally:

### Prerequisites
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

### Setup
```bash
# 1. Clone the repository and navigate to its directory:
git clone https://github.com/jaimeadf/git-link && cd BetterDiscordPlugins

# 2. Install the dependencies:
yarn install

# 3. Create a file named `.env.local` and set `GITHUB_TOKEN=YOUR_ACCESS_TOKEN`.

# 4. Run the `dev` script:
yarn dev

# 🎉 Now, you can open the app at http://localhost:3000
```