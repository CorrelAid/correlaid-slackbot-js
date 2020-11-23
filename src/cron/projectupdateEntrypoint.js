const responses = require('../utils/responses')
const verifyUtils = require('../utils/verifyUtils')
const slackUtils = require('../utils/slackUtils')
const axios = require('axios')
const AWS = require('aws-sdk')
const querystring = require('querystring')

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
const SLACK_PROJECTS_CHANNEL = process.env.SLACK_PROJECTS_CHANNEL
const PROJECTUPDATE_ARN = process.env.PROJECTUPDATE_ARN

module.exports.handler = async function(event, context) {
    console.log(event)
    let channelToPost = ''
    if (event['detail-type'] === 'Scheduled Event') {
        // cron
        channelToPost = SLACK_PROJECTS_CHANNEL
    } else {
        // triggered via http / slash command
        // check whether request is indeed coming from slack
        if (!verifyUtils.requestIsVerified(event, SLACK_SIGNING_SECRET)) {
            return responses.buildForbiddenResponse()
        }

        channelToPost = querystring.parse(event.body).channel_id
    }

    const result = await slackUtils.postToChannel(
        channelToPost,
        'Project board update is being generated. This can take a couple of seconds...'
    )
    if (result.data.ok) {
        var params = {
            FunctionName: PROJECTUPDATE_ARN,
            Payload: JSON.stringify({ channel_id: channelToPost }),
            InvocationType: 'Event',
        }
        const result = await new AWS.Lambda().invoke(params).promise()
        console.log(result)
    } else {
        throw Error(result.data.error)
    }

    // return nothing
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: '',
    }
}
