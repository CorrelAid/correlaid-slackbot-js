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

const getFile = () => {
    return octokit.repos.getContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: GITHUB_FILE,
    })
}
const addUrlToReadme = async (url, title) => {
    return getFile()
        .then(readme => {
            // add url
            console.log(`adding new content to readme`)
            updateFile(readme, url, title)
        })
        .catch(error => {
            strErr = `error during adding to README: ${JSON.stringify(
                error,
                null,
                2
            )}`
            console.log(strErr)
            return Promise.reject(Error(strErr))
        })
}

const createBase64Content = (oldContent, url, title) => {
    // decode old content
    const toAdd = `- [${title}](${url})`
    const oldContentDec = Buffer.from(oldContent, 'base64').toString('utf-8')
    let newContent = Buffer.from(oldContentDec + '\n' + toAdd).toString(
        'base64'
    )

    return newContent
}

const updateFile = (readme, url, title) => {
    newContent = createBase64Content(readme.data.content, url, title)
    sha = readme.data.sha
    commitMessage = `added link for ${url}`

    return octokit.repos
        .createOrUpdateFile({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: GITHUB_FILE,
            message: commitMessage,
            content: newContent,
            sha: sha,
        })
        .catch(error => {
            return Promise.reject(Error(error))
        })
}

module.exports = {
    getFile,
    addUrlToReadme,
    createBase64Content,
}
