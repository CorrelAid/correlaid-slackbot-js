const querystring = require('querystring')
const responses = require('../utils/responses')
const verifyUtils = require('../utils/verifyUtils')
const utils = require('../utils/utils')
const githubUtils = require('../utils/githubUtils')
const slackUtils = require('../utils/slackUtils')

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
const SLACK_PROJECTS_CHANNEL = process.env.SLACK_PROJECTS_CHANNEL

module.exports.handler = async function(event, context) {
    // this will be triggerd by the entrypoint so we do not need to verify the slack secret
    console.log(event)
    const channelId = event.channel_id
    const cardsByCol = await githubUtils.getCardsByCol()
    const message = githubUtils.createBoardSummaryText(cardsByCol)
    const result = await slackUtils.postToChannel(channelId, message)
    // use the messageTs to thread
    const colTexts = githubUtils.createColumnSummaryTexts(cardsByCol)
    for (const colText of colTexts) {
        await slackUtils.commentOnPost(result.data.ts, channelId, colText)
    }
}
