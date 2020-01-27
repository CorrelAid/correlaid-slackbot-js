require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const slackUtils = require('../utils/slackUtils')
const githubUtils = require('../utils/githubUtils')
const utils = require('../utils/utils')

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
            } catch (err) {
                return Promise.reject(Error(stringifyErr(err)))
            }
        })
        .catch(err => {
            strErr = utils.stringifyErr(
                err,
                'an error occurred during hackmd processing:'
            )
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
                    Error('hackmd already in dynamodb. doing nothing')
                )
            }
        })
        .catch(err => {
            // rethrow the error
            return Promise.reject(
                Error(
                    utils.stringifyErr(err, 'error during querying dynamodb:')
                )
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
        .catch(err => {
            return Promise.reject(
                Error(utils.stringifyErr(err, 'unable to add item:'))
            )
        })
}

const loadHtml = hackmdURL => {
    return axios
        .get(hackmdURL)
        .then(response => {
            if (response.status === 200) {
                return cheerio.load(response.data)
            } else {
                return Promise.reject(
                    Error(
                        `Could not load html for ${hackmdURL}: ${response.status}`
                    )
                )
            }
        })
        .catch(err => {
            return Promise.reject(
                Error(`Could not load html for ${hackmdURL}: ${err.message}`)
            )
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
    } catch (err) {
        console.log(err)
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
