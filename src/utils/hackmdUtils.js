require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const slackUtils = require('../utils/slackUtils')
const utils = require('../utils/utils')

const cleanUrl = url => {
    editRegex = /\?.+?$/
    return url.replace(editRegex, '')
}

const downloadFromCodiMD = codimdURL => {
    return axios
        .get(codimdURL)
        .then(response => response.data)
        .catch(err => {
            return Promise.reject(
                Error(`Could not load html for ${hackmdURL}: ${err.message}`)
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
    downloadFromCodiMD,
}
