const responses = require('../utils/responses');
const slackUtils = require('../utils/slackUtils');
const verifyUtils = require('../utils/verifyUtils');
const utils = require('../utils/utils');
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

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
    console.debug(slackEvent);
    if (slackEvent.type === 'link_shared') {
      if (utils.containsLinkFromDomain(slackEvent.links, 'hackmd.io')) {
        const message = utils.readFromFile(
          './src/messages/link_to_orgapad.txt'
        );
        await slackUtils.commentOnPost(
          slackEvent.message_ts,
          slackEvent.channel,
          message
        );
        return responses.buildSuccessResponse('success');
      }
    }
  }
};
