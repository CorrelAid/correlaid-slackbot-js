const responses = require('../utils/responses');
const slackUtils = require('../utils/slackUtils');
const verifyUtils = require('../utils/verifyUtils');
const hackmdUtils = require('../utils/hackmdUtils')
const utils = require('../utils/utils');
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const AWS = require("aws-sdk")
AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient()


module.exports.handler = async function(event, context) {
  // check whether request is coming from slack
  if (!verifyUtils.requestIsVerified(event, SLACK_SIGNING_SECRET)) {
    return responses.buildForbiddenResponse();
  }

  const eventBody = JSON.parse(event.body);
  console.log(eventBody);

  if (eventBody.type === 'url_verification') {
    const urlVerificationResponse = responses.buildUrlVerificationResponse(
      eventBody
    );
    return urlVerificationResponse;
  } else if (eventBody.type === 'event_callback') {
    const slackEvent = eventBody.event;
    if (slackEvent.type === 'link_shared') {
      if (utils.containsLinkFromDomain(slackEvent.links, 'hackmd.io')) {
        hackmdUrls = slackEvent.links.filter(link => link.domain === 'hackmd.io').map(link => link.url)

        for (const url of hackmdUrls) {
          cleanedUrl = hackmdUtils.cleanUrl(url)
          const data = slackEvent
          await hackmdUtils.addHackmdToDynamo(dynamoDb, cleanedUrl, data)
        };
        return responses.buildSuccessResponse('success');
      }
    }
  }
};
