require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const slackUtils = require('../utils/slackUtils')
const githubUtils = require('../utils/githubUtils')

const cleanUrl = url => {
    editRegex = /\?.+?$/
    return url.replace(editRegex, '')
}

const processHackmd = async (dynamoDb, url, data) => {
    const isAlreadyInDynamo = await checkHackmdInDynamo(dynamoDb, url)
    if (isAlreadyInDynamo) {
        message = `${url} already in dynamodb. doing nothing.`
        console.log(message)
        await slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, message)
        return
    }
    const $ = await loadHtml(url)
    const title = getTitle($)
    await githubUtils.addUrlToReadme(url, title)
    await createHackmdEntry(dynamoDb, url, title, data)
}

const checkHackmdInDynamo = async (dynamoDb, url) => {
    const params = {
        TableName: process.env.HACKMD_TABLE,
        Key: {
            url: url,
        },
    }

    const isInDynamoDb = await dynamoDb
        .get(params)
        .promise()
        .then(result => {
            if (result.Item) {
                return true
            }
            return false
        })
        .catch(error => {
            console.error("couldn't find hackmd", error)
            return false
        })
    return isInDynamoDb
}

const createHackmdEntry = async (dynamoDb, url, title, data) => {
    const params = {
        TableName: process.env.HACKMD_TABLE,
        Item: {
            url: url,
            title: title,
            data: data,
        },
    }
    await dynamoDb.put(params, function(err, data) {
        if (err) {
            strErr = `unable to add item: ${JSON.stringify(err, null, 2)}`
            console.error(strErr)
            slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, strErr)
        } else {
            message = `added item: ${JSON.stringify(params, null, 2)}`
            console.log(message)
            slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, message)
        }
    })
}

const loadHtml = async hackmdURL => {
    const $ = await axios
        .get(hackmdURL)
        .then(response => {
            if (response.status === 200) {
                return cheerio.load(response.data)
            }
        })
        .catch(function(error) {
            console.log(error)
        })
    return $
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
