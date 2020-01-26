require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const slackUtils = require('../utils/slackUtils')
const githubUtils = require('../utils/githubUtils')

const cleanUrl = url => {
    editRegex = /\?.+?$/
    return url.replace(editRegex, '')
}

const processHackmd = async (dynamoDb, url, slackEventData) => {
    return await needToProcessHackmd(dynamoDb, url)
        .then(() => loadHtml(url))
        .then($ => getTitle($))
        .then(async title => {
            // once we have the title we can add to dynamodb and to github readme
            try {
                await createHackmdEntry(dynamoDb, url, title, slackEventData)
                await githubUtils.addUrlToReadme(url, title)
            } catch (error) {
                return Promise.reject(error)
            }
        })
        .catch(error => {
            strErr = `error during hackmd processing: ${JSON.stringify(
                error,
                null,
                2
            )}}`
            slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, strErr)
            console.log(strErr)
        })
}

const needToProcessHackmd = async (dynamoDb, url) => {
    const params = {
        TableName: process.env.HACKMD_TABLE,
        Key: {
            url: url,
        },
    }

    return dynamoDb
        .get(params)
        .promise()
        .then(result => {
            console.log(result)
            if (!!result.Item) {
                // already in dynamodb
                return Promise.reject(
                    'hackmd already in dynamodb. doing nothing'
                )
            }
        })
        .catch(error => {
            // rethrow the error
            return Promise.reject(
                Error('error during querying dynamodb: ', error)
            )
        })
}

const createHackmdEntry = async (dynamoDb, url, title, slackEventData) => {
    const params = {
        TableName: process.env.HACKMD_TABLE,
        Item: {
            url: url,
            title: title,
            slackEventData: slackEventData,
            source: 'lambda',
        },
    }

    return dynamoDb
        .put(params)
        .promise()
        .then(() => {
            message = `added item: ${JSON.stringify(params, null, 2)}`
            slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, message)
            console.log(message)
        })
        .catch(error => {
            strErr = `unable to add item: ${JSON.stringify(error, null, 2)}`
            return Promise.reject(Error(strErr))
        })
}

const loadHtml = hackmdURL => {
    return axios.get(hackmdURL).then(response => {
        if (response.status === 200) {
            return cheerio.load(response.data)
        }
    })
}

const getMarkdown = $ => {
    return $('div#doc').text()
}

const getTitle = $ => {
    // strip " - HackMD" from title
    try {
        fullTitle = $('head title').text()
        const regex = / - HackMD$/
        title = fullTitle.replace(regex, '')
    } catch (error) {
        console.log(error)
        title = 'title not known'
    }
    return title
}
module.exports = {
    loadHtml,
    getTitle,
    cleanUrl,
    getMarkdown,
    createHackmdEntry,
    processHackmd,
}
