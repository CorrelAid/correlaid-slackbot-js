require('dotenv').config()
const axios = require('axios')
const Octokit = require("@octokit/rest");
const GITHUB_PAT = process.env.GITHUB_PAT
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_FILE = process.env.GITHUB_FILE


const octokit = new Octokit({
  auth: GITHUB_PAT
});

const getFile = async file => {

    return await octokit.repos.getContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: GITHUB_FILE
      })
}
const addUrlToReadme = async (url, title) => {
    readmeFile = await getFile(GITHUB_FILE)
    // add url
    linkBase = createLinkTextBase64(url, title)
    newContent = readmeFile.data.content + linkBase
    sha = readmeFile.data.sha
    commitMessage = `added link for ${url}`
    await updateFile(GITHUB_FILE, sha, newContent, commitMessage)
}

const createLinkTextBase64 = (url, title) => {
    linkStr = `- [${title}](${url})\n`
    const linkBase = Buffer.from(linkStr).toString('base64')
    return linkBase
}

const updateFile = async (file, sha, newContent, commitMessage) => {

    await octokit.repos.createOrUpdateFile({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: GITHUB_FILE,
        message: commitMessage,
        content: newContent,
        sha: sha, 
    })
}

module.exports = {
    getFile,
    addUrlToReadme,
    createLinkTextBase64,
}
