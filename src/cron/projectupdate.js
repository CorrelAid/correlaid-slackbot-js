const querystring = require('querystring')
const responses = require('../utils/responses')
const verifyUtils = require('../utils/verifyUtils')
const utils = require('../utils/utils')
const hackmdUtils = require('../utils/hackmdUtils')

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

module.exports.handler = async function(event, context) {
    // check whether request is coming from slack
    if (!verifyUtils.requestIsVerified(event, SLACK_SIGNING_SECRET)) {
        return responses.buildForbiddenResponse()
    }

    console.log(event.body)
    // get list of slack channels that need to be posted to from pad.correlaid.org
    await loadHtml(process.env.SLACK_CHANNEL_LIST)
        .then($ => getMarkdown($))
        .then()
        .catch(err => {
            strErr = utils.stringifyErr(
                err,
                'an error occurred during codimd processing:'
            )
            slackUtils.postToChannel(process.env.SLACK_DEBUG_CHANNEL, strErr)
            console.log(strErr)
        })
}
