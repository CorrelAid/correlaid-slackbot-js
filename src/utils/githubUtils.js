require('dotenv').config()
const axios = require('axios')
const Octokit = require('@octokit/rest')
const GITHUB_PAT = process.env.GITHUB_PAT
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_FILE = process.env.GITHUB_FILE

const octokit = new Octokit({
    auth: GITHUB_PAT,
})

const getFile = async () => {
    return await octokit.repos.getContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: GITHUB_FILE,
    })
}
const addUrlToReadme = async (url, title) => {
    readmeFile = await getFile()
    // add url
    newContent = createBase64Content(readmeFile.data.content, url, title)
    sha = readmeFile.data.sha
    commitMessage = `added link for ${url}`
    await updateFile(sha, newContent, commitMessage)
}

const createBase64Content = (oldContent, url, title) => {
    // decode old content
    const toAdd = `- [${title}](${url})`
    const oldContentDec = Buffer.from(oldContent, "base64").toString('utf-8');
    let newContent = Buffer.from(oldContentDec + "\n" + toAdd).toString('base64');

    return newContent
}

const updateFile = async (sha, newContent, commitMessage) => {
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
    createBase64Content,
}
