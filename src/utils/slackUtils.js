require('dotenv').config()
const axios = require('axios')
const querystring = require('querystring')
const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN

const postToChannel = async (channelId, message) => {
    return axios
        .post(
            'https://slack.com/api/chat.postMessage',
            querystring.stringify({
                token: SLACK_API_TOKEN,
                channel: channelId,
                text: message,
            })
        )
        .then(function(response) {
            if (response.data.ok == false) {
                console.log(
                    `error comenting in channel: ${response.data.ok}: ${response.data.error}`
                )
                return response.data.error
            } else {
                return response
            }
        })
        .catch(function(error) {
            console.log(error)
            return error
        })
}

const commentOnPost = async (messageTs, channelId, message) => {
    return axios
        .post(
            'https://slack.com/api/chat.postMessage',
            querystring.stringify({
                token: SLACK_API_TOKEN,
                channel: channelId,
                text: message,
                thread_ts: messageTs,
            })
        )
        .then(function(response) {
            if (response.data.ok == false) {
                console.log(
                    `error comenting on post: ${response.data.ok}: ${response.data.error}`
                )
                return response.data.error
            } else {
                console.log('successfully commented on post.')
            }
        })
        .catch(function(error) {
            console.log(error)
            return error
        })
}

module.exports = {
    postToChannel,
    commentOnPost,
}
